import { createCanvas, loadImage, SKRSContext2D } from '@napi-rs/canvas';
import { TranslatedBlock, TranslatedPage } from '../types';
import { fontFamilyForText, registerTranslationFonts } from './fonts';

const DEVANAGARI = /[\u0900-\u097F]/;

interface LaidOutText {
  size: number;
  lines: string[];
  lineHeight: number;
}

function wrapLines(ctx: SKRSContext2D, text: string, maxWidth: number): string[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length === 0 || maxWidth <= 0) return [];
  const lines: string[] = [];
  let current = '';

  const pushToken = (token: string) => {
    if (ctx.measureText(token).width <= maxWidth) {
      current = current ? `${current} ${token}` : token;
      return;
    }
    if (current) {
      lines.push(current);
      current = '';
    }
    let chunk = '';
    for (const char of token) {
      const trial = chunk + char;
      if (ctx.measureText(trial).width <= maxWidth) {
        chunk = trial;
      } else {
        if (chunk) lines.push(chunk);
        chunk = char;
      }
    }
    current = chunk;
  };

  for (const token of tokens) {
    if (!current) {
      pushToken(token);
      continue;
    }
    const trial = `${current} ${token}`;
    if (ctx.measureText(trial).width <= maxWidth) {
      current = trial;
    } else {
      lines.push(current);
      current = '';
      pushToken(token);
    }
  }
  if (current) lines.push(current);
  return lines;
}

function textLineHeight(ctx: SKRSContext2D, family: string, size: number, devanagari: boolean): number {
  ctx.font = `${size}px "${family}"`;
  const metrics = ctx.measureText(devanagari ? 'ककिीं' : 'Mg');
  const ascent = metrics.actualBoundingBoxAscent || size * 0.8;
  const descent = metrics.actualBoundingBoxDescent || size * 0.25;
  const leading = devanagari ? size * 0.28 : size * 0.18;
  return ascent + descent + leading;
}

function fitText(
  ctx: SKRSContext2D,
  text: string,
  family: string,
  innerWidth: number,
  innerHeight: number,
  devanagari: boolean
): LaidOutText {
  let size = Math.min(72, Math.max(8, innerHeight));
  let best: LaidOutText = { size: 6, lines: [text], lineHeight: 8 };
  while (size >= 6) {
    ctx.font = `${size}px "${family}"`;
    const lineHeight = textLineHeight(ctx, family, size, devanagari);
    const lines = wrapLines(ctx, text, innerWidth);
    const fits =
      lines.length > 0 &&
      lines.length * lineHeight <= innerHeight + 0.5 &&
      lines.every((line) => ctx.measureText(line).width <= innerWidth + 0.5);
    if (fits) {
      return { size, lines, lineHeight };
    }
    best = { size, lines, lineHeight };
    size -= 0.5;
  }
  return best;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface PixelBox {
  x: number;
  y: number;
  width: number;
  height: number;
  background: Rgb;
}

export async function overlayTranslatedText(
  png: Buffer,
  page: TranslatedPage,
  targetLanguage: string
): Promise<Buffer> {
  registerTranslationFonts();
  const image = await loadImage(png);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const placed = page.blocks
    .map((block) => ({ block, box: coverBox(ctx, block, image.width, image.height) }))
    .filter((item): item is { block: TranslatedBlock; box: PixelBox } => item.box !== null);

  if (placed.length > 0) {
    const snapshot = ctx.getImageData(0, 0, image.width, image.height);
    for (const item of placed) {
      eraseInk(snapshot.data, image.width, image.height, item.box);
    }
    ctx.putImageData(snapshot, 0, 0);
  }

  for (const item of placed) {
    drawBlock(ctx, item.block, item.box, targetLanguage);
  }

  return canvas.toBuffer('image/png');
}

function coverBox(
  ctx: SKRSContext2D,
  block: TranslatedBlock,
  pageWidth: number,
  pageHeight: number
): PixelBox | null {
  if (!block.translatedText.trim()) return null;
  const x = Math.round(clamp(block.bbox.x * pageWidth, 0, pageWidth - 1));
  const y = Math.round(clamp(block.bbox.y * pageHeight, 0, pageHeight - 1));
  const width = Math.round(clamp(block.bbox.width * pageWidth, 8, pageWidth - x));
  const height = Math.round(clamp(block.bbox.height * pageHeight, 8, pageHeight - y));
  const snapshot = ctx.getImageData(0, 0, pageWidth, pageHeight);
  const background = backgroundColor(snapshot.data, pageWidth, pageHeight, x, y, width, height);
  const grown = expandToInk(snapshot.data, pageWidth, pageHeight, x, y, width, height, background);
  return { ...grown, background };
}

/**
 * Remove source glyphs by painting them with the local background color.
 * A solid white rectangle would hide a colored band behind the paragraph.
 */
function eraseInk(
  data: Uint8ClampedArray,
  pageWidth: number,
  pageHeight: number,
  box: PixelBox
) {
  paintInk(data, pageWidth, pageHeight, box.x, box.y, box.width, box.height, box.background);
  // Light gray source text survives a tight box. Pad only on a light page so a
  // colored band is not painted over with the page color.
  if (luminance(box.background) < 180) return;
  const pad = 10;
  paintInk(
    data,
    pageWidth,
    pageHeight,
    box.x - pad,
    box.y - pad,
    box.width + pad * 2,
    box.height + pad * 2,
    box.background
  );
}

function paintInk(
  data: Uint8ClampedArray,
  pageWidth: number,
  pageHeight: number,
  x: number,
  y: number,
  width: number,
  height: number,
  background: Rgb
) {
  const x0 = clampInt(x, 0, pageWidth - 1);
  const y0 = clampInt(y, 0, pageHeight - 1);
  const x1 = clampInt(x + width, x0 + 1, pageWidth);
  const y1 = clampInt(y + height, y0 + 1, pageHeight);
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const index = (py * pageWidth + px) * 4;
      if (!isInk(data, index, background)) continue;
      data[index] = background.r;
      data[index + 1] = background.g;
      data[index + 2] = background.b;
    }
  }
}

function backgroundColor(
  data: Uint8ClampedArray,
  pageWidth: number,
  pageHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
): Rgb {
  const read = (px: number, py: number): Rgb => {
    const index = (py * pageWidth + px) * 4;
    return { r: data[index] ?? 255, g: data[index + 1] ?? 255, b: data[index + 2] ?? 255 };
  };
  const ring: Rgb[] = [];
  const pad = 4;
  const outerLeft = clampInt(x - pad, 0, pageWidth - 1);
  const outerTop = clampInt(y - pad, 0, pageHeight - 1);
  const outerRight = clampInt(x + width + pad, 0, pageWidth);
  const outerBottom = clampInt(y + height + pad, 0, pageHeight);
  for (let py = outerTop; py < outerBottom; py += 1) {
    for (let px = outerLeft; px < outerRight; px += 2) {
      const inside = px >= x && px < x + width && py >= y && py < y + height;
      if (!inside) ring.push(read(px, py));
    }
  }
  const fromRing = dominant(ring);
  if (fromRing) return fromRing;

  const interior: Rgb[] = [];
  const x1 = clampInt(x + width, 0, pageWidth);
  const y1 = clampInt(y + height, 0, pageHeight);
  for (let py = clampInt(y, 0, pageHeight - 1); py < y1; py += 2) {
    for (let px = clampInt(x, 0, pageWidth - 1); px < x1; px += 2) {
      interior.push(read(px, py));
    }
  }
  return dominant(interior) ?? { r: 255, g: 255, b: 255 };
}

function expandToInk(
  data: Uint8ClampedArray,
  pageWidth: number,
  pageHeight: number,
  x: number,
  y: number,
  width: number,
  height: number,
  background: Rgb
): { x: number; y: number; width: number; height: number } {
  let left = x;
  let top = y;
  let right = x + width;
  let bottom = y + height;
  const lightPage = luminance(background) > 180;
  const verticalGrow = lightPage
    ? Math.min(72, Math.max(28, Math.round(Math.max(height, 12) * 1.25)))
    : Math.min(48, Math.max(16, Math.round(Math.max(height, 12) * 0.75)));
  // Follow source ink across word spaces. On a colored band, stop at the
  // edge of that color so the surrounding page is not painted over.
  const horizontalGrow = pageWidth;
  const verticalGap = lightPage ? 14 : 8;
  const horizontalGap = lightPage ? 18 : 16;

  const rowHasInk = (py: number, x0: number, x1: number) => {
    const start = clampInt(x0, 0, pageWidth - 1);
    const end = clampInt(x1, start, pageWidth);
    for (let px = start; px < end; px += 2) {
      if (isInk(data, (py * pageWidth + px) * 4, background)) return true;
    }
    return false;
  };
  const colHasInk = (px: number, y0: number, y1: number) => {
    const start = clampInt(y0, 0, pageHeight - 1);
    const end = clampInt(y1, start, pageHeight);
    for (let py = start; py < end; py += 2) {
      if (isInk(data, (py * pageWidth + px) * 4, background)) return true;
    }
    return false;
  };
  const columnStillOnBackground = (px: number, y0: number, y1: number) => {
    if (lightPage) return true;
    const start = clampInt(y0, 0, pageHeight - 1);
    const end = clampInt(y1, start, pageHeight);
    for (let py = start; py < end; py += 2) {
      if (!isInk(data, (py * pageWidth + px) * 4, background)) return true;
    }
    return false;
  };

  let empty = 0;
  for (let py = bottom; py < pageHeight && py < y + height + verticalGrow; py += 1) {
    if (rowHasInk(py, left, right)) {
      empty = 0;
      bottom = py + 1;
    } else if (++empty > verticalGap) break;
  }
  empty = 0;
  for (let py = top - 1; py >= 0 && py > y - verticalGrow; py -= 1) {
    if (rowHasInk(py, left, right)) {
      empty = 0;
      top = py;
    } else if (++empty > verticalGap) break;
  }
  const shapeTop = Math.max(0, top - 12);
  const shapeBottom = Math.min(pageHeight, bottom + 12);
  empty = 0;
  for (let px = right; px < pageWidth && px < x + width + horizontalGrow; px += 1) {
    if (!columnStillOnBackground(px, shapeTop, shapeBottom)) break;
    if (colHasInk(px, top, bottom)) {
      empty = 0;
      right = px + 1;
    } else if (++empty > horizontalGap) break;
  }
  empty = 0;
  for (let px = left - 1; px >= 0 && px > x - horizontalGrow; px -= 1) {
    if (!columnStillOnBackground(px, shapeTop, shapeBottom)) break;
    if (colHasInk(px, top, bottom)) {
      empty = 0;
      left = px;
    } else if (++empty > horizontalGap) break;
  }

  return { x: left, y: top, width: Math.max(8, right - left), height: Math.max(8, bottom - top) };
}

function isInk(data: Uint8ClampedArray, index: number, background: Rgb): boolean {
  const dr = (data[index] ?? 0) - background.r;
  const dg = (data[index + 1] ?? 0) - background.g;
  const db = (data[index + 2] ?? 0) - background.b;
  // 12 catches light-gray source text (~#e4e4e4) that still reads as English.
  // Off-white paper within ~10 levels of the sampled background is left alone.
  return dr * dr + dg * dg + db * db > 12 * 12;
}

function dominant(samples: Rgb[]): Rgb | null {
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (const sample of samples) {
    const key = ((sample.r >> 4) << 8) | ((sample.g >> 4) << 4) | (sample.b >> 4);
    const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bucket.n += 1;
    bucket.r += sample.r;
    bucket.g += sample.g;
    bucket.b += sample.b;
    buckets.set(key, bucket);
  }
  let best: { n: number; r: number; g: number; b: number } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.n > best.n) best = bucket;
  }
  if (!best || best.n === 0) return null;
  return { r: Math.round(best.r / best.n), g: Math.round(best.g / best.n), b: Math.round(best.b / best.n) };
}

function textColor(background: Rgb, preferred: string | undefined): string {
  const chosen = parseHex(preferred);
  if (chosen && contrast(chosen, background) >= 3) return preferred!;
  return luminance(background) > 150 ? '#111827' : '#ffffff';
}

function parseHex(value: string | undefined): Rgb | null {
  if (!value) return null;
  const match = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (!match?.[1]) return null;
  const hex = match[1];
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function luminance(color: Rgb): number {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

function contrast(a: Rgb, b: Rgb): number {
  const l1 = luminance(a) / 255;
  const l2 = luminance(b) / 255;
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

function drawBlock(
  ctx: SKRSContext2D,
  block: TranslatedBlock,
  box: PixelBox,
  targetLanguage: string
) {
  const text = block.translatedText.trim();
  if (!text) return;

  const x = box.x;
  const y = box.y;
  const width = box.width;
  const height = box.height;

  const devanagari = targetLanguage === 'hi' || targetLanguage === 'mr' || targetLanguage === 'ne' || DEVANAGARI.test(text);
  const family = fontFamilyForText(text, targetLanguage);
  const insetX = Math.min(width * 0.03, Math.max(2, height * 0.04));
  const insetY = Math.min(height * 0.06, Math.max(1, height * 0.05));
  const innerWidth = Math.max(4, width - insetX * 2);
  const innerHeight = Math.max(4, height - insetY * 2);
  const layout = fitText(ctx, text, family, innerWidth, innerHeight, devanagari);

  ctx.font = `${layout.size}px "${family}"`;
  ctx.fillStyle = textColor(box.background, block.color);
  ctx.textBaseline = 'top';
  ctx.textAlign = block.align === 'center' ? 'center' : block.align === 'right' ? 'right' : 'left';

  const startX =
    block.align === 'center' ? x + width / 2 : block.align === 'right' ? x + width - insetX : x + insetX;
  let cursorY = y + insetY;
  for (const line of layout.lines) {
    if (cursorY + layout.lineHeight > y + height + 0.5) break;
    ctx.fillText(line, startX, cursorY);
    cursorY += layout.lineHeight;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}
