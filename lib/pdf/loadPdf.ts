import { PDFDocument } from 'pdf-lib';

export const PASSWORD_PROTECTED_PDF =
  'This PDF is password-protected and cannot be processed.';

export async function loadPdf(data: ArrayBuffer | Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/encrypt/i.test(message)) {
      throw new Error(PASSWORD_PROTECTED_PDF);
    }
    throw error;
  }
}
