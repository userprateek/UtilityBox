import type { PDFDocumentProxy } from 'pdfjs-dist';

type PdfJsModule = typeof import('pdfjs-dist');

let pdfjsPromise: Promise<PdfJsModule> | null = null;

async function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs') as Promise<PdfJsModule>;
  }
  return pdfjsPromise;
}

export async function openPdfDocument(
  buffer: Buffer,
  password?: string
): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
  }

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    password,
    verbosity: 0,
    useSystemFonts: true,
    isOffscreenCanvasSupported: false,
  });
  return loadingTask.promise;
}

export function isPasswordError(error: unknown): boolean {
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message : String(error);
  return (
    name === 'PasswordException' ||
    /password/i.test(message) ||
    /encrypted/i.test(message)
  );
}
