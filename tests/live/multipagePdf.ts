import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { createCanvas } from '@napi-rs/canvas';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createWorker } from 'tesseract.js';

export const LIVE_PAGE_TEXT = [
  'The public library opens at nine in the morning and closes at six in the evening. Visitors may borrow two books at a time.',
  'Please return every borrowed book within fourteen days. A late fee of ten rupees applies for each extra day.',
];

const DEVANAGARI = /[\u0900-\u097F]/;

export function redactSecrets(value: string): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  let out = value;
  if (key && key.length > 8) out = out.split(key).join('[REDACTED]');
  return out
    .replace(/AQ\.[A-Za-z0-9_-]{8,}/g, '[REDACTED]')
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, '[REDACTED]')
    .replace(/(api[_-]?key["']?\s*[:=]\s*["']?)[^"'\s&]+/gi, '$1[REDACTED]')
    .replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]');
}

export function errorSummary(error: unknown): string {
  if (error instanceof Error) {
    const extra = error as Error & { status?: number; code?: string };
    return redactSecrets(
      [extra.code, extra.status, error.name, error.message]
        .filter((part) => part !== undefined && part !== '')
        .join(' | ')
    );
  }
  return redactSecrets(String(error));
}

export async function buildLiveMultipagePdf(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const text of LIVE_PAGE_TEXT) {
    const page = pdf.addPage([612, 792]);
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(trial, 18) > 520) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = trial;
      }
    }
    if (current) lines.push(current);
    let y = 700;
    for (const line of lines) {
      page.drawText(line, { x: 48, y, size: 18, font, color: rgb(0, 0, 0) });
      y -= 32;
    }
  }
  return Buffer.from(await pdf.save());
}

export async function ocrPdfText(buffer: Buffer, language: string): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const workerPath = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
  }

  const doc = await pdfjs
    .getDocument({
      data: new Uint8Array(buffer),
      verbosity: 0,
      useSystemFonts: true,
      isOffscreenCanvasSupported: false,
    })
    .promise;

  const worker = await createWorker(language, undefined, { logger: () => undefined });
  try {
    const parts: string[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const context = canvas.getContext('2d');
      await page.render({
        canvas: canvas as unknown as HTMLCanvasElement,
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;
      const recognized = await worker.recognize(canvas.toBuffer('image/png'));
      parts.push(recognized.data.text || '');
    }
    return parts.join('\n');
  } finally {
    await worker.terminate();
  }
}

const SOURCE_MARKERS = ['public library', 'borrow two books', 'late fee', 'fourteen days'];

export async function inspectOutputPdf(buffer: Buffer): Promise<{
  opened: boolean;
  pageCount: number;
  bytes: number;
  devanagari: boolean;
  ocrSample: string;
  englishMarkers: string[];
}> {
  if (!buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-')) {
    throw new Error('Output is not a PDF');
  }
  const pdf = await PDFDocument.load(buffer);
  const pageCount = pdf.getPageCount();
  const ocrText = await ocrPdfText(buffer, 'hin+eng');
  const compact = ocrText.replace(/\s+/g, ' ').trim();
  const english = compact.toLowerCase();
  return {
    opened: true,
    pageCount,
    bytes: buffer.length,
    devanagari: DEVANAGARI.test(ocrText),
    ocrSample: compact.slice(0, 280),
    englishMarkers: SOURCE_MARKERS.filter((marker) => english.includes(marker)),
  };
}

export function translatedTextSummary(document: {
  pages: Array<{ blocks: Array<{ translatedText: string }> }>;
}): { blockCount: number; devanagari: boolean; sample: string } {
  const texts = document.pages
    .flatMap((page) => page.blocks.map((block) => block.translatedText.trim()))
    .filter(Boolean);
  const joined = texts.join(' ');
  return {
    blockCount: texts.length,
    devanagari: DEVANAGARI.test(joined),
    sample: joined.slice(0, 240),
  };
}

export function writeLiveReport(filename: string, report: unknown): string {
  const dir = path.join(process.cwd(), '.local/testing/evidence/outputs/document-translator');
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, filename);
  fs.writeFileSync(dest, JSON.stringify(report, null, 2));
  return dest;
}
