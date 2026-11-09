import { createWorker } from 'tesseract.js';
import { BoundingBox, TextBlockType, TranslateContentInput } from '../types';
import { groupLinesIntoParagraphs, LineFragment } from '../reconstruct/geometry';
import { RasterPage } from './rasterize';

export function normalizeImageBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  pixelWidth: number,
  pixelHeight: number
): BoundingBox {
  const width = Math.max(1, pixelWidth);
  const height = Math.max(1, pixelHeight);
  const x = Math.min(1, Math.max(0, x0 / width));
  const y = Math.min(1, Math.max(0, y0 / height));
  const right = Math.min(1, Math.max(x, x1 / width));
  const bottom = Math.min(1, Math.max(y, y1 / height));
  return {
    x,
    y,
    width: Math.max(0.01, right - x),
    height: Math.max(0.01, bottom - y),
  };
}

function ocrLangFor(sourceLanguage: string): string {
  if (sourceLanguage === 'hi' || sourceLanguage === 'auto') return 'eng+hin';
  return 'eng';
}

export async function ocrPages(
  pages: RasterPage[],
  sourceLanguage: string
): Promise<TranslateContentInput['pages']> {
  const worker = await createWorker(ocrLangFor(sourceLanguage), undefined, {
    logger: () => undefined,
  });

  try {
    const result: TranslateContentInput['pages'] = [];
    for (const page of pages) {
      const recognized = await worker.recognize(page.png, undefined, { blocks: true, text: true });
      const paragraphs =
        recognized.data.blocks?.flatMap((block) => block.paragraphs) ?? [];
      const pixelWidth = page.pixelWidth || page.width;
      const pixelHeight = page.pixelHeight || page.height;

      const lines: LineFragment[] = [];
      for (const paragraph of paragraphs) {
        const originalText = paragraph.text.replace(/\s+/g, ' ').trim();
        if (!originalText) continue;
        const box = paragraph.bbox;
        const normalized = normalizeImageBox(box.x0, box.y0, box.x1, box.y1, pixelWidth, pixelHeight);
        lines.push({
          text: originalText,
          x: normalized.x,
          y: normalized.y,
          width: normalized.width,
          height: normalized.height,
        });
      }
      const grouped = groupLinesIntoParagraphs(lines, `p${page.pageNumber}`);

      const blocks: TranslateContentInput['pages'][number]['blocks'] = grouped.map((paragraph) => {
        const type: TextBlockType = paragraph.text.length < 40 ? 'label' : 'paragraph';
        return {
          id: paragraph.id,
          type,
          originalText: paragraph.text,
          bbox: paragraph.bbox,
        };
      });

      if (blocks.length === 0 && recognized.data.text.trim()) {
        blocks.push({
          id: `p${page.pageNumber}-b1`,
          type: 'paragraph',
          originalText: recognized.data.text.replace(/\s+/g, ' ').trim(),
          bbox: { x: 0.06, y: 0.06, width: 0.88, height: 0.88 },
        });
      }

      result.push({
        pageNumber: page.pageNumber,
        width: page.width,
        height: page.height,
        blocks,
      });
    }
    return result;
  } finally {
    await worker.terminate();
  }
}
