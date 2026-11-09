/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { overlayTranslatedText } from './overlay';

describe('overlayTranslatedText', () => {
  it('covers the source paragraph and leaves pixels outside that box untouched', async () => {
    const width = 480;
    const height = 220;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ff0000';
    ctx.font = '22px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('The public library opens at nine', 36, 48);
    ctx.fillText('in the evening today.', 36, 78);
    ctx.fillStyle = '#000000';
    ctx.fillRect(430, 180, 12, 12);

    const png = await overlayTranslatedText(
      canvas.toBuffer('image/png'),
      {
        pageNumber: 1,
        width,
        height,
        blocks: [
          {
            id: 'p1-b1',
            type: 'paragraph',
            originalText: 'The public library opens at nine in the evening today.',
            translatedText: 'सार्वजनिक पुस्तकालय सुबह नौ बजे खुलता है और शाम को बंद होता है।',
            uncertain: false,
            bbox: { x: 28 / width, y: 40 / height, width: 390 / width, height: 78 / height },
          },
        ],
      },
      'hi'
    );

    const image = await loadImage(png);
    const out = createCanvas(image.width, image.height);
    const read = out.getContext('2d');
    read.drawImage(image, 0, 0);
    const outside = read.getImageData(436, 186, 1, 1).data;
    const farCorner = read.getImageData(8, 8, 1, 1).data;
    const covered = read.getImageData(28, 40, 390, 78).data;
    let red = 0;
    let ink = 0;
    for (let i = 0; i < covered.length; i += 4) {
      const r = covered[i] ?? 0;
      const g = covered[i + 1] ?? 0;
      const b = covered[i + 2] ?? 0;
      if (r > 180 && g < 80 && b < 80) red += 1;
      if (r < 80 && g < 80 && b < 80) ink += 1;
    }

    expect(red).toBe(0);
    expect(ink).toBeGreaterThan(20);
    expect(outside[0]).toBeLessThan(40);
    expect(farCorner[0]).toBeGreaterThan(240);
  });

  it('keeps a colored band and erases only the source glyphs', async () => {
    const width = 640;
    const height = 240;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#d91a1a';
    ctx.fillRect(40, 40, 360, 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('The public library opens at nine.', 52, 52);
    ctx.fillStyle = '#1a33e6';
    ctx.fillRect(560, 160, 48, 48);

    const png = await overlayTranslatedText(
      canvas.toBuffer('image/png'),
      {
        pageNumber: 1,
        width,
        height,
        blocks: [
          {
            id: 'band',
            type: 'paragraph',
            originalText: 'The public library opens at nine.',
            translatedText: 'सार्वजनिक पुस्तकालय नौ बजे खुलता है।',
            uncertain: false,
            bbox: { x: 48 / width, y: 46 / height, width: 300 / width, height: 32 / height },
          },
        ],
      },
      'hi'
    );

    const image = await loadImage(png);
    const out = createCanvas(image.width, image.height);
    const read = out.getContext('2d');
    read.drawImage(image, 0, 0);
    const band = read.getImageData(70, 48, 80, 28).data;
    let red = 0;
    let white = 0;
    for (let i = 0; i < band.length; i += 4) {
      const r = band[i] ?? 0;
      const g = band[i + 1] ?? 0;
      const b = band[i + 2] ?? 0;
      if (r > 160 && g < 80 && b < 80) red += 1;
      if (r > 220 && g > 220 && b > 220) white += 1;
    }
    const square = read.getImageData(570, 170, 1, 1).data;
    expect(red).toBeGreaterThan(40);
    expect(white).toBeLessThan(8);
    expect(square[2]).toBeGreaterThan(150);
  });

  it('covers source ink that sticks out of a short box', async () => {
    const width = 520;
    const height = 160;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#1020d0';
    ctx.font = '22px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('Visitors may borrow two books at a time.', 24, 70);

    const png = await overlayTranslatedText(
      canvas.toBuffer('image/png'),
      {
        pageNumber: 1,
        width,
        height,
        blocks: [
          {
            id: 'line',
            type: 'paragraph',
            originalText: 'Visitors may borrow two books at a time.',
            translatedText: 'आगंतुक एक बार में दो पुस्तकें उधार ले सकते हैं।',
            uncertain: false,
            bbox: { x: 24 / width, y: 76 / height, width: 460 / width, height: 10 / height },
          },
        ],
      },
      'hi'
    );

    const image = await loadImage(png);
    const out = createCanvas(image.width, image.height);
    const read = out.getContext('2d');
    read.drawImage(image, 0, 0);
    const line = read.getImageData(24, 68, 470, 28).data;
    let blue = 0;
    let ink = 0;
    for (let i = 0; i < line.length; i += 4) {
      const r = line[i] ?? 0;
      const g = line[i + 1] ?? 0;
      const b = line[i + 2] ?? 0;
      if (b > 160 && r < 80 && g < 80) blue += 1;
      if (r < 60 && g < 60 && b < 60) ink += 1;
    }
    expect(blue).toBe(0);
    expect(ink).toBeGreaterThan(10);
  });

  it('removes light-gray source text without painting a distant colored mark', async () => {
    const width = 640;
    const height = 220;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#c5d0dc';
    ctx.font = '22px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('The public library opens at nine.', 24, 48);
    ctx.fillStyle = '#1a33e6';
    ctx.fillRect(560, 150, 40, 40);

    const png = await overlayTranslatedText(
      canvas.toBuffer('image/png'),
      {
        pageNumber: 1,
        width,
        height,
        blocks: [
          {
            id: 'gray',
            type: 'paragraph',
            originalText: 'The public library opens at nine.',
            translatedText: 'सार्वजनिक पुस्तकालय नौ बजे खुलता है।',
            uncertain: false,
            bbox: { x: 24 / width, y: 50 / height, width: 420 / width, height: 24 / height },
          },
        ],
      },
      'hi'
    );

    const image = await loadImage(png);
    const out = createCanvas(image.width, image.height);
    const read = out.getContext('2d');
    read.drawImage(image, 0, 0);
    const line = read.getImageData(20, 40, 460, 50).data;
    let gray = 0;
    let ink = 0;
    for (let i = 0; i < line.length; i += 4) {
      const r = line[i] ?? 0;
      const g = line[i + 1] ?? 0;
      const b = line[i + 2] ?? 0;
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (b > r + 6 && g > r + 3 && luminance > 160) gray += 1;
      if (luminance < 80) ink += 1;
    }
    const square = read.getImageData(570, 160, 1, 1).data;
    expect(gray).toBe(0);
    expect(ink).toBeGreaterThan(10);
    expect(square[2]).toBeGreaterThan(150);
  });

  it('clears the rest of a source line when the box covers only the first word', async () => {
    const width = 720;
    const height = 180;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#1020d0';
    ctx.font = '22px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('The public library opens at nine.', 24, 40);
    ctx.fillStyle = '#1a33e6';
    ctx.fillRect(640, 120, 36, 36);

    const png = await overlayTranslatedText(
      canvas.toBuffer('image/png'),
      {
        pageNumber: 1,
        width,
        height,
        blocks: [
          {
            id: 'first-word',
            type: 'paragraph',
            originalText: 'The public library opens at nine.',
            translatedText: 'सार्वजनिक पुस्तकालय नौ बजे खुलता है।',
            uncertain: false,
            bbox: { x: 24 / width, y: 44 / height, width: 36 / width, height: 16 / height },
          },
        ],
      },
      'hi'
    );

    const image = await loadImage(png);
    const out = createCanvas(image.width, image.height);
    const read = out.getContext('2d');
    read.drawImage(image, 0, 0);
    const line = read.getImageData(20, 36, 560, 40).data;
    let blue = 0;
    let ink = 0;
    for (let i = 0; i < line.length; i += 4) {
      const r = line[i] ?? 0;
      const g = line[i + 1] ?? 0;
      const b = line[i + 2] ?? 0;
      if (b > 160 && r < 80 && g < 80) blue += 1;
      if (r < 40 && g < 40 && b < 40) ink += 1;
    }
    const square = read.getImageData(650, 130, 1, 1).data;
    expect(blue).toBe(0);
    expect(ink).toBeGreaterThan(10);
    expect(square[2]).toBeGreaterThan(150);
  });

  it('clears both English sentences on the notice photo from a short box on each line', async () => {
    const sourcePath = path.join(process.cwd(), '.local/testing/fixtures/master/notice.jpg');
    const source = await loadImage(sourcePath);
    const width = source.width;
    const height = source.height;
    const png = await overlayTranslatedText(fs.readFileSync(sourcePath), {
      pageNumber: 1,
      width,
      height,
      blocks: [
        {
          id: 'line-1',
          type: 'paragraph',
          originalText: 'The public library opens at nine.',
          translatedText: 'सार्वजनिक पुस्तकालय सुबह नौ बजे खुलता है।',
          uncertain: false,
          bbox: { x: 47 / width, y: 78 / height, width: 70 / width, height: 12 / height },
        },
        {
          id: 'line-2',
          type: 'paragraph',
          originalText: 'Visitors may borrow two books at a time.',
          translatedText: 'आगंतुक एक समय में दो पुस्तकें उधार ले सकते हैं।',
          uncertain: false,
          bbox: { x: 44 / width, y: 128 / height, width: 70 / width, height: 12 / height },
        },
      ],
    }, 'hi');

    const before = createCanvas(width, height);
    const beforeCtx = before.getContext('2d');
    beforeCtx.drawImage(source, 0, 0);
    const sourcePixels = beforeCtx.getImageData(0, 0, width, height).data;
    const image = await loadImage(png);
    const after = createCanvas(width, height);
    const afterCtx = after.getContext('2d');
    afterCtx.drawImage(image, 0, 0);
    const outputPixels = afterCtx.getImageData(0, 0, width, height).data;
    let kept = 0;
    for (let i = 0; i < sourcePixels.length; i += 4) {
      const luminance =
        0.2126 * (sourcePixels[i] ?? 0) +
        0.7152 * (sourcePixels[i + 1] ?? 0) +
        0.0722 * (sourcePixels[i + 2] ?? 0);
      if (luminance > 80) continue;
      const unchanged =
        Math.abs((sourcePixels[i] ?? 0) - (outputPixels[i] ?? 0)) < 12 &&
        Math.abs((sourcePixels[i + 1] ?? 0) - (outputPixels[i + 1] ?? 0)) < 12 &&
        Math.abs((sourcePixels[i + 2] ?? 0) - (outputPixels[i + 2] ?? 0)) < 12;
      if (unchanged) kept += 1;
    }
    fs.mkdirSync(path.join(process.cwd(), '.local/testing/evidence/remediation/translator'), { recursive: true });
    fs.writeFileSync(
      path.join(process.cwd(), '.local/testing/evidence/remediation/translator/TR-03-local.png'),
      png
    );
    expect(kept).toBeLessThan(20);
  });
});