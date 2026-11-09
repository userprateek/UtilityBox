import { PDFDocument } from 'pdf-lib';
import { loadPdf, PASSWORD_PROTECTED_PDF } from './loadPdf';
import { readOutlineEntries, writeOutlineEntries } from './outlines';

export interface MergedPdfResult {
  blob: Blob;
  size: number;
  pageCount: number;
  filename: string;
}

/**
 * Safely reads a File / Blob as an ArrayBuffer across all browsers & test environments.
 */
export async function readFileAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return await file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Merges multiple PDF files in client-side memory using pdf-lib.
 * 100% private and runs in the browser.
 */
export async function mergePdfFiles(
  files: File[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<MergedPdfResult> {
  if (!files || files.length === 0) {
    throw new Error('No PDF files provided to merge.');
  }

  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;
  const collectedOutlines: { title: string; pageIndex: number }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;

    onProgress?.(i + 1, files.length, `Merging ${file.name}...`);

    const arrayBuffer = await readFileAsArrayBuffer(file);
    let pdfToMerge;
    try {
      pdfToMerge = await loadPdf(arrayBuffer);
    } catch (error) {
      if (error instanceof Error && error.message === PASSWORD_PROTECTED_PDF) {
        throw new Error(
          `"${file.name}" is password-protected and cannot be merged. Remove the password and try again.`
        );
      }
      throw error;
    }
    const outlineEntries = readOutlineEntries(pdfToMerge).map((entry) => ({
      title: entry.title,
      pageIndex: entry.pageIndex + totalPages,
    }));
    const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
      totalPages++;
    }
    collectedOutlines.push(...outlineEntries);
  }

  if (collectedOutlines.length > 0) {
    writeOutlineEntries(mergedPdf, collectedOutlines);
  }

  onProgress?.(files.length, files.length, 'Finalizing merged PDF document...');

  const mergedPdfBytes = await mergedPdf.save();
  const mergedBlob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });

  const baseName = files[0]?.name.replace(/\.pdf$/i, '') || 'merged_document';
  const filename = `${baseName}_merged.pdf`;

  return {
    blob: mergedBlob,
    size: mergedBlob.size,
    pageCount: totalPages,
    filename,
  };
}
