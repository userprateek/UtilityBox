/**
 * Live Gemini cases TR-01, TR-02, TR-03, TR-10, TR-11, TR-12, TR-13.
 * Not a Jest mock. Does not print the API key.
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { createCanvas } from '@napi-rs/canvas';
import { PDFDocument } from 'pdf-lib';
import { translateDocument } from '@/lib/ai/translation/orchestrator';
import { errorSummary, ocrPdfText } from './multipagePdf';
import { buildLiveMultipagePdf } from './multipagePdf';

const outDir = path.join(
  process.cwd(),
  process.env.TRANSLATION_EVIDENCE_DIR || '.local/testing/evidence/master-run/translator'
);
const gen = path.join(process.cwd(), '.local/testing/fixtures/master');
fs.mkdirSync(outDir, { recursive: true });

type Status = 'PASS' | 'FAIL' | 'BLOCKED';

const onlyCases = new Set(
  (process.env.TRANSLATION_CASES || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
);
const results: Array<Record<string, unknown>> = [];

function record(id: string, status: Status, detail: string) {
  results.push({ id, status, detail });
  console.log(`${id} ${status} ${detail}`);
}

async function render(buffer: Buffer, dest: string) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const worker = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(worker).href;
  const doc = await pdfjs
    .getDocument({ data: new Uint8Array(buffer), verbosity: 0, isOffscreenCanvasSupported: false })
    .promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext('2d');
  await page.render({
    canvas: canvas as unknown as HTMLCanvasElement,
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
  }).promise;
  fs.writeFileSync(dest, canvas.toBuffer('image/png'));
  return { canvas, viewport, width: canvas.width, height: canvas.height };
}

function redCount(
  canvas: {
    getContext(type: '2d'): {
      getImageData(x: number, y: number, w: number, h: number): { data: Uint8ClampedArray };
    };
  },
  x: number,
  y: number,
  w: number,
  h: number
) {
  const data = canvas.getContext('2d').getImageData(x, y, w, h).data;
  let red = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i]! > 160 && data[i + 1]! < 80 && data[i + 2]! < 80) red += 1;
  }
  return red;
}

async function run() {
  const providerCases: Array<{
    id: string;
    file: string;
    mime: string;
    target: string;
  }> = [
    { id: 'TR-01', file: 'scanned-english.pdf', mime: 'application/pdf', target: 'hi' },
    { id: 'TR-02', file: 'colored-band.pdf', mime: 'application/pdf', target: 'hi' },
    { id: 'TR-03', file: 'notice.jpg', mime: 'image/jpeg', target: 'hi' },
    { id: 'TR-10', file: 'dense-line.pdf', mime: 'application/pdf', target: 'hi' },
    { id: 'TR-11', file: '', mime: 'application/pdf', target: 'es' },
    { id: 'TR-13', file: 'heading-body.pdf', mime: 'application/pdf', target: 'hi' },
  ];

  for (const item of providerCases) {
    if (onlyCases.size > 0 && !onlyCases.has(item.id)) continue;
    const buffer = item.id === 'TR-11' ? await buildLiveMultipagePdf() : fs.readFileSync(path.join(gen, item.file));
    const started = Date.now();
    try {
      const result = await translateDocument({
        buffer,
        mimeType: item.mime,
        fileName: item.file || 'library.pdf',
        sourceLanguage: 'en',
        targetLanguage: item.target,
      });
      if (!result.ok) {
        record(item.id, 'FAIL', errorSummary(result.message));
        continue;
      }
      const dest = path.join(outDir, `${item.id}.${result.mimeType === 'application/pdf' ? 'pdf' : 'jpg'}`);
      fs.writeFileSync(dest, result.buffer);
      let ocr = '';
      if (result.mimeType === 'application/pdf') {
        ocr = (await ocrPdfText(result.buffer, item.target === 'hi' ? 'hin+eng' : 'eng')).replace(/\s+/g, ' ');
        const rendered = await render(result.buffer, path.join(outDir, `${item.id}-page.png`));
        if (item.id === 'TR-02') {
          const scale = 1.5;
          const x = Math.round(48 * scale);
          const y = Math.round((792 - 680) * scale);
          const reds = redCount(rendered.canvas, x, y, Math.round(200 * scale), Math.round(30 * scale));
          if (reds < 20) {
            record(item.id, 'FAIL', `colored band lost (${reds} red pixels) after ${Date.now() - started}ms`);
            continue;
          }
        }
        if (item.id === 'TR-13') {
          const scale = 1.5;
          const px = Math.round(520 * scale);
          const py = Math.round((792 - 120) * scale);
          const pixel = rendered.canvas.getContext('2d').getImageData(px, py, 1, 1).data;
          if ((pixel[2] ?? 0) < 150) {
            record(item.id, 'FAIL', 'blue square was not preserved');
            continue;
          }
        }
        const pdf = await PDFDocument.load(result.buffer);
        if (item.id === 'TR-12') {
          /* handled below */
        }
        const english = /public library|borrow two books|fourteen days/i.test(ocr);
        if (item.target === 'hi' && english) {
          record(item.id, 'FAIL', 'rendered OCR still contains source English');
          continue;
        }
        if (item.target === 'hi' && !/[\u0900-\u097F]/.test(ocr)) {
          record(item.id, 'FAIL', 'rendered OCR has no Devanagari');
          continue;
        }
        if (item.id === 'TR-10') {
          const compact = ocr.trim();
          const closed = /[।.]$/.test(compact);
          if (compact.length < 20 || !closed) {
            record(item.id, 'FAIL', 'page image does not show a complete translated sentence');
            continue;
          }
        }
        void pdf;
      } else {
        ocr = 'image-output';
      }
      record(item.id, 'PASS', `${result.strategy} ${result.mimeType} ${Date.now() - started}ms`);
    } catch (error) {
      record(item.id, 'FAIL', errorSummary(error));
    }
  }

  try {
    if (onlyCases.size > 0 && !onlyCases.has('TR-12')) {
      fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2));
      return;
    }
    const source = fs.readFileSync(path.join(gen, 'heading-body.pdf'));
    const result = await translateDocument({
      buffer: source,
      mimeType: 'application/pdf',
      fileName: 'heading-body.pdf',
      sourceLanguage: 'en',
      targetLanguage: 'hi',
    });
    if (!result.ok) {
      record('TR-12', 'FAIL', result.message);
    } else {
      const pdf = await PDFDocument.load(result.buffer);
      const size = pdf.getPage(0).getSize();
      const ok = pdf.getPageCount() === 1 && Math.abs(size.width - 612) < 2 && Math.abs(size.height - 792) < 2;
      record('TR-12', ok ? 'PASS' : 'FAIL', `pages ${pdf.getPageCount()} ${size.width.toFixed(1)}x${size.height.toFixed(1)}`);
    }
  } catch (error) {
    record('TR-12', 'FAIL', errorSummary(error));
  }

  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.log('RUN_FAIL', errorSummary(error));
  process.exit(1);
});
