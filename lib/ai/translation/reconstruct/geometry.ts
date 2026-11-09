import { BoundingBox, TranslatedBlock, TranslatedDocument, TranslatedPage } from '../types';

export interface LineFragment {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MeasuredRegion {
  id: string;
  text: string;
  bbox: BoundingBox;
  lineHeight: number;
}

function unionBox(lines: LineFragment[]): { x: number; y: number; width: number; height: number; lineHeight: number } {
  const minX = Math.min(...lines.map((line) => line.x));
  const minY = Math.min(...lines.map((line) => line.y));
  const maxX = Math.max(...lines.map((line) => line.x + line.width));
  const maxY = Math.max(...lines.map((line) => line.y + line.height));
  const lineHeight = Math.max(...lines.map((line) => line.height));
  return {
    x: minX,
    y: minY,
    width: Math.max(0.02, maxX - minX),
    height: Math.max(lineHeight, maxY - minY),
    lineHeight,
  };
}

function sameParagraph(previous: LineFragment[], line: LineFragment): boolean {
  const prev = previous[previous.length - 1];
  if (!prev) return false;
  const prevBox = unionBox(previous);
  const lineHeight = Math.max(prevBox.lineHeight, line.height, 0.005);
  const gap = line.y - (prev.y + prev.height);
  const stacked = gap >= -lineHeight * 0.4 && gap <= lineHeight * 1.05;
  const leftDelta = Math.abs(line.x - prevBox.x);
  const overlapsX = line.x < prevBox.x + prevBox.width && line.x + line.width > prevBox.x;
  const aligned = leftDelta <= lineHeight * 1.5 || overlapsX;
  const similarSize =
    line.height > 0 &&
    prevBox.lineHeight > 0 &&
    line.height / prevBox.lineHeight >= 0.65 &&
    line.height / prevBox.lineHeight <= 1.5;
  return stacked && aligned && similarSize;
}

function clampBox(box: BoundingBox): BoundingBox {
  const x = Math.min(1, Math.max(0, box.x));
  const y = Math.min(1, Math.max(0, box.y));
  const right = Math.min(1, Math.max(x, box.x + box.width));
  const bottom = Math.min(1, Math.max(y, box.y + box.height));
  return {
    x,
    y,
    width: Math.max(0.01, right - x),
    height: Math.max(0.01, bottom - y),
  };
}

function verticalOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.y < b.y + b.height && a.y + a.height > b.y;
}

function horizontalOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x;
}

/**
 * Expand a measured text box by a fraction of its line height, stopping at
 * halfway to a neighbouring region so the cover does not swallow other content.
 */
export function padRegion(box: BoundingBox, lineHeight: number, others: BoundingBox[]): BoundingBox {
  let padX = lineHeight * 0.2;
  let padY = lineHeight * 0.35;
  for (const other of others) {
    if (verticalOverlap(box, other)) {
      const gapRight = other.x - (box.x + box.width);
      const gapLeft = box.x - (other.x + other.width);
      if (gapRight > 0) padX = Math.min(padX, gapRight / 2);
      if (gapLeft > 0) padX = Math.min(padX, gapLeft / 2);
    }
    if (horizontalOverlap(box, other)) {
      const gapBelow = other.y - (box.y + box.height);
      const gapAbove = box.y - (other.y + other.height);
      if (gapBelow > 0) padY = Math.min(padY, gapBelow / 2);
      if (gapAbove > 0) padY = Math.min(padY, gapAbove / 2);
    }
  }
  return clampBox({
    x: box.x - padX,
    y: box.y - padY,
    width: box.width + padX * 2,
    height: box.height + padY * 2,
  });
}

export function groupLinesIntoParagraphs(lines: LineFragment[], idPrefix: string): MeasuredRegion[] {
  const sorted = [...lines].sort((a, b) => a.y - b.y || a.x - b.x);
  const groups: LineFragment[][] = [];
  for (const line of sorted) {
    const current = groups[groups.length - 1];
    if (current && sameParagraph(current, line)) {
      current.push(line);
    } else {
      groups.push([line]);
    }
  }

  const raw = groups.map((group) => {
    const box = unionBox(group);
    return {
      text: group
        .map((line) => line.text.trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
      bbox: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
      lineHeight: box.lineHeight,
    };
  });

  return raw.map((region, index) => ({
    id: `${idPrefix}-b${index + 1}`,
    text: region.text,
    lineHeight: region.lineHeight,
    bbox: padRegion(
      region.bbox,
      region.lineHeight,
      raw.filter((_, other) => other !== index).map((item) => item.bbox)
    ),
  }));
}

function centerInside(block: BoundingBox, region: BoundingBox): boolean {
  const cx = block.x + block.width / 2;
  const cy = block.y + block.height / 2;
  return cx >= region.x && cx <= region.x + region.width && cy >= region.y && cy <= region.y + region.height;
}

function intersectionArea(a: BoundingBox, b: BoundingBox): number {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  if (right <= x || bottom <= y) return 0;
  return (right - x) * (bottom - y);
}

function readingOrder<T extends { bbox: BoundingBox }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.bbox.y - b.bbox.y || a.bbox.x - b.bbox.x);
}

/**
 * Draw translations inside the measured source paragraphs. Model boxes are only
 * used to decide which translation belongs to which paragraph.
 */
export function anchorPageToMeasuredRegions(
  modelBlocks: TranslatedBlock[],
  measured: MeasuredRegion[]
): TranslatedBlock[] {
  if (measured.length === 0 || modelBlocks.length === 0) return modelBlocks;

  const orderedModel = readingOrder(modelBlocks);
  const buckets = new Map<number, TranslatedBlock[]>();
  const matched = new Set<TranslatedBlock>();

  for (const block of orderedModel) {
    let best = -1;
    let bestScore = 0;
    measured.forEach((region, index) => {
      const area = Math.max(block.bbox.width * block.bbox.height, 0.0001);
      const overlap = intersectionArea(block.bbox, region.bbox) / area;
      const score = centerInside(block.bbox, region.bbox) ? Math.max(overlap, 0.5) : overlap;
      if (score > bestScore) {
        bestScore = score;
        best = index;
      }
    });
    if (best >= 0 && bestScore > 0.15) {
      const list = buckets.get(best) ?? [];
      list.push(block);
      buckets.set(best, list);
      matched.add(block);
    }
  }

  if (matched.size === 0) {
    orderedModel.forEach((block, index) => {
      const target = Math.min(
        measured.length - 1,
        Math.floor((index * measured.length) / orderedModel.length)
      );
      const list = buckets.get(target) ?? [];
      list.push(block);
      buckets.set(target, list);
    });
  } else {
    for (const block of orderedModel) {
      if (matched.has(block)) continue;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      measured.forEach((region, index) => {
        const distance = Math.abs(
          block.bbox.y + block.bbox.height / 2 - (region.bbox.y + region.bbox.height / 2)
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });
      const list = buckets.get(nearest) ?? [];
      list.push(block);
      buckets.set(nearest, list);
    }
  }

  return measured.flatMap((region, index) => {
    const blocks = buckets.get(index);
    if (!blocks || blocks.length === 0) return [];
    const translatedText = readingOrder(blocks)
      .map((block) => block.translatedText.trim())
      .filter(Boolean)
      .join(' ');
    if (!translatedText) return [];
    return [withRegion({ ...blocks[0]!, translatedText }, region)];
  });
}

function withRegion(block: TranslatedBlock, region: MeasuredRegion): TranslatedBlock {
  return {
    ...block,
    id: region.id,
    originalText: region.text || block.originalText,
    bbox: region.bbox,
    fontSize: undefined,
  };
}

export function anchorDocumentToMeasuredRegions(
  document: TranslatedDocument,
  measuredByPage: Map<number, MeasuredRegion[]>
): TranslatedDocument {
  const pages: TranslatedPage[] = document.pages.map((page) => {
    const measured = measuredByPage.get(page.pageNumber) ?? [];
    if (measured.length === 0) return page;
    return {
      ...page,
      blocks: anchorPageToMeasuredRegions(page.blocks, measured),
    };
  });
  return { ...document, pages };
}
