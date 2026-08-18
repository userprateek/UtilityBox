import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from './pdfMerger';

export type SplitMode = 'all_pages' | 'range' | 'fixed_interval';

export interface SplitPdfOptions {
  mode: SplitMode;
  pageRange?: string; // e.g. "1-3, 5, 7-9"
  fixedInterval?: number; // e.g. every 2 pages
}

export interface SplitPdfResultItem {
  blob: Blob;
  filename: string;
  size: number;
  pageCount: number;
  pageDescription: string;
}

/**
 * Reads a PDF file and returns its total page count.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdfDoc.getPageCount();
}

/**
 * Parses user range string like "1-3, 5, 8-10" into 0-indexed page numbers.
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const clean = rangeStr.replace(/\s+/g, '');
  if (!clean) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pagesSet = new Set<number>();
  const parts = clean.split(',');

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr || '', 10);
      const end = parseInt(endStr || '', 10);
      if (!isNaN(start) && !isNaN(end)) {
        const minP = Math.max(1, Math.min(start, end));
        const maxP = Math.min(totalPages, Math.max(start, end));
        for (let p = minP; p <= maxP; p++) {
          pagesSet.add(p - 1);
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        pagesSet.add(p - 1);
      }
    }
  }

  return Array.from(pagesSet).sort((a, b) => a - b);
}

/**
 * In-browser PDF splitting engine powered by pdf-lib.
 */
export async function splitPdfDocument(
  file: File,
  options: SplitPdfOptions,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<SplitPdfResultItem[]> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const baseName = file.name.replace(/\.pdf$/i, '');
  const results: SplitPdfResultItem[] = [];

  if (options.mode === 'all_pages') {
    // Split into 1 page per PDF file
    for (let i = 0; i < totalPages; i++) {
      onProgress?.(i + 1, totalPages, `Extracting page ${i + 1} of ${totalPages}...`);
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(srcPdf, [i]);
      if (copiedPage) {
        newPdf.addPage(copiedPage);
        const bytes = await newPdf.save();
        const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
        results.push({
          blob,
          filename: `${baseName}_page_${i + 1}.pdf`,
          size: blob.size,
          pageCount: 1,
          pageDescription: `Page ${i + 1}`,
        });
      }
    }
  } else if (options.mode === 'range') {
    // Custom range (e.g. 1-3, 5) into one extracted PDF
    const targetPages = parsePageRangeString(options.pageRange || '', totalPages);
    if (targetPages.length === 0) {
      throw new Error(`Invalid page range. Please select pages between 1 and ${totalPages}.`);
    }

    onProgress?.(1, 1, `Extracting ${targetPages.length} selected pages...`);
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(srcPdf, targetPages);
    copiedPages.forEach((p) => newPdf.addPage(p));

    const bytes = await newPdf.save();
    const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });

    const rangeLabel = options.pageRange ? `pages_${options.pageRange.replace(/[^\w-]/g, '_')}` : 'extracted';
    results.push({
      blob,
      filename: `${baseName}_${rangeLabel}.pdf`,
      size: blob.size,
      pageCount: targetPages.length,
      pageDescription: `Pages ${targetPages.map((p) => p + 1).join(', ')}`,
    });
  } else if (options.mode === 'fixed_interval') {
    const interval = Math.max(1, options.fixedInterval || 2);
    let chunkIndex = 1;

    for (let i = 0; i < totalPages; i += interval) {
      const chunkPages = [];
      for (let j = i; j < Math.min(i + interval, totalPages); j++) {
        chunkPages.push(j);
      }

      onProgress?.(
        Math.min(i + interval, totalPages),
        totalPages,
        `Extracting part ${chunkIndex} (pages ${i + 1}-${i + chunkPages.length})...`
      );

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(srcPdf, chunkPages);
      copiedPages.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      results.push({
        blob,
        filename: `${baseName}_part_${chunkIndex}.pdf`,
        size: blob.size,
        pageCount: chunkPages.length,
        pageDescription: `Pages ${i + 1} to ${i + chunkPages.length}`,
      });
      chunkIndex++;
    }
  }

  return results;
}
