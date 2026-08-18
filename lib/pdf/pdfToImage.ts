import { readFileAsArrayBuffer } from './pdfMerger';
import { parsePageRangeString } from './pdfSplitter';

// Polyfill TC39 Stage-3 methods used in pdfjs-dist v4/v5/v6
if (typeof Map !== 'undefined') {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapProto = Map.prototype as any;
  if (typeof mapProto.getOrInsertComputed !== 'function') {
    mapProto.getOrInsertComputed = function (key: unknown, callback: (k: unknown) => unknown) {
      if (this.has(key)) {
        return this.get(key);
      }
      const val = callback(key);
      this.set(key, val);
      return val;
    };
  }

  if (typeof mapProto.getOrInsert !== 'function') {
    mapProto.getOrInsert = function (key: unknown, defaultValue: unknown) {
      if (this.has(key)) {
        return this.get(key);
      }
      this.set(key, defaultValue);
      return defaultValue;
    };
  }
}

if (typeof Promise !== 'undefined') {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const promiseObj = Promise as any;
  if (typeof promiseObj.withResolvers !== 'function') {
    promiseObj.withResolvers = function () {
      let resolve: (value: unknown) => void;
      let reject: (reason?: unknown) => void;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve: resolve!, reject: reject! };
    };
  }
}

export interface PdfToImageOptions {
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  dpi?: number; // 72, 150, 300
  pageSelection?: 'all' | 'custom';
  customPages?: string;
  quality?: number; // 0.1 to 1.0
}

export interface PdfToImageResultItem {
  blob: Blob;
  filename: string;
  size: number;
  width: number;
  height: number;
  pageNumber: number;
  previewUrl: string;
}

/**
 * Client-side PDF-to-Image renderer using PDF.js and Canvas 2D.
 * Converts PDF pages into high-DPI JPG, PNG, or WebP images.
 */
export async function convertPdfToImages(
  file: File,
  options: PdfToImageOptions = {},
  onProgress?: (current: number, total: number, message: string) => void
): Promise<PdfToImageResultItem[]> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs').catch(() => import('pdfjs-dist'));

  // Configure PDF.js worker
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.2.108'}/legacy/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await readFileAsArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
  });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  const format = options.format || 'image/jpeg';
  const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
  const dpi = options.dpi || 150;
  const scale = Math.max(1, dpi / 72); // 72 DPI is 1.0x, 150 DPI is ~2.08x, 300 DPI is ~4.16x
  const quality = options.quality ?? 0.92;

  // Determine pages to render
  let targetPages: number[] = [];
  if (options.pageSelection === 'custom' && options.customPages) {
    targetPages = parsePageRangeString(options.customPages, totalPages);
  } else {
    targetPages = Array.from({ length: totalPages }, (_, i) => i);
  }

  if (targetPages.length === 0) {
    targetPages = Array.from({ length: totalPages }, (_, i) => i);
  }

  const baseName = file.name.replace(/\.pdf$/i, '');
  const results: PdfToImageResultItem[] = [];

  for (let idx = 0; idx < targetPages.length; idx++) {
    const pageIndex = targetPages[idx]!;
    const pageNum = pageIndex + 1;

    onProgress?.(
      idx + 1,
      targetPages.length,
      `Rendering page ${pageNum} of ${totalPages} at ${dpi} DPI...`
    );

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not supported in this browser.');
    }

    // Fill clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: ctx,
      viewport,
    };

    // Render page to canvas
    // @ts-expect-error PDF.js render types
    await page.render(renderContext).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) return reject(new Error(`Failed to convert page ${pageNum} to image.`));
          resolve(b);
        },
        format,
        quality
      );
    });

    const previewUrl = URL.createObjectURL(blob);
    const filename = `${baseName}_page_${pageNum}.${ext}`;

    results.push({
      blob,
      filename,
      size: blob.size,
      width: canvas.width,
      height: canvas.height,
      pageNumber: pageNum,
      previewUrl,
    });
  }

  return results;
}
