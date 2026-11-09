import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { ClassifiedDocument, TranslatedDocument } from '../types';
import { extractPdfTextBlocks } from '../extract/pdfText';
import { RasterPage } from '../extract/rasterize';
import { anchorDocumentToMeasuredRegions, MeasuredRegion } from './geometry';
import { overlayTranslatedText } from './overlay';

async function measuredParagraphs(buffer: Buffer): Promise<Map<number, MeasuredRegion[]>> {
  const pages = await extractPdfTextBlocks(buffer);
  const map = new Map<number, MeasuredRegion[]>();
  for (const page of pages) {
    const regions = page.blocks
      .filter((block) => block.originalText.trim().length > 0)
      .map((block) => ({
        id: block.id,
        text: block.originalText,
        bbox: block.bbox,
        lineHeight: Math.min(block.bbox.height, 0.04),
      }));
    if (regions.length > 0) map.set(page.pageNumber, regions);
  }
  return map;
}

export async function reconstructOutput(options: {
  classified: ClassifiedDocument;
  originalBuffer: Buffer;
  originalMime: string;
  document: TranslatedDocument;
  pageImages: RasterPage[];
  targetLanguage: string;
}): Promise<{ buffer: Buffer; mimeType: string }> {
  const { classified, originalBuffer, originalMime, document, pageImages, targetLanguage } = options;

  let placed = document;
  if (originalBuffer.subarray(0, 5).toString('ascii').startsWith('%PDF-')) {
    try {
      const measured = await measuredParagraphs(originalBuffer);
      if (measured.size > 0) {
        placed = anchorDocumentToMeasuredRegions(document, measured);
      }
    } catch {
      placed = document;
    }
  }

  const overlaid: Array<{ png: Buffer; width: number; height: number }> = [];
  for (const image of pageImages) {
    const page =
      placed.pages.find((item) => item.pageNumber === image.pageNumber) ?? placed.pages[0];
    if (!page) continue;
    const png = await overlayTranslatedText(image.png, page, targetLanguage);
    overlaid.push({ png, width: image.width, height: image.height });
  }

  if (overlaid.length === 0) {
    throw new Error('Reconstruction produced no pages.');
  }

  if (classified.kind === 'pdf' || originalMime === 'application/pdf') {
    const pdf = await PDFDocument.create();
    for (const page of overlaid) {
      const embedded = await pdf.embedPng(page.png);
      const pdfPage = pdf.addPage([page.width, page.height]);
      pdfPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: page.width,
        height: page.height,
      });
    }
    return { buffer: Buffer.from(await pdf.save()), mimeType: 'application/pdf' };
  }

  const first = overlaid[0];
  if (!first) {
    throw new Error('Reconstruction produced no pages.');
  }

  let pipeline = sharp(first.png);
  if (originalMime === 'image/jpeg') {
    pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
  } else if (originalMime === 'image/webp') {
    pipeline = pipeline.webp({ quality: 90 });
  } else {
    pipeline = pipeline.png();
  }

  return { buffer: await pipeline.toBuffer(), mimeType: originalMime };
}
