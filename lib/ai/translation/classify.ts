import sharp from 'sharp';
import { ClassifiedDocument } from './types';
import { detectFileKind, kindToMime } from './fileSignature';
import { MIN_EXTRACTABLE_CHARS } from './limits';
import { isPasswordError, openPdfDocument } from './pdfjs';

export class EncryptedPdfError extends Error {
  constructor() {
    super('This PDF is password-protected and cannot be translated.');
    this.name = 'EncryptedPdfError';
  }
}

export class UnsupportedDocumentError extends Error {
  constructor(message = 'This file type is not supported.') {
    super(message);
    this.name = 'UnsupportedDocumentError';
  }
}

export async function classifyDocument(buffer: Buffer, claimedMime?: string): Promise<ClassifiedDocument> {
  const kind = detectFileKind(buffer);
  const mimeType = kindToMime(kind);
  if (!mimeType) {
    throw new UnsupportedDocumentError();
  }

  if (claimedMime && claimedMime !== mimeType && !(claimedMime === 'image/jpg' && mimeType === 'image/jpeg')) {
    if (
      !(claimedMime.startsWith('image/') && mimeType.startsWith('image/')) &&
      claimedMime !== 'application/pdf'
    ) {
      throw new UnsupportedDocumentError('The file contents do not match the uploaded file type.');
    }
  }

  if (kind === 'pdf') {
    try {
      const pdf = await openPdfDocument(buffer);
      const pageCount = pdf.numPages;
      let textChars = 0;

      const pagesToScan = Math.min(pageCount, 3);
      for (let i = 1; i <= pagesToScan; i += 1) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textChars += content.items.reduce((sum, item) => {
          const str = 'str' in item ? String(item.str) : '';
          return sum + str.replace(/\s+/g, '').length;
        }, 0);
      }

      return {
        kind: 'pdf',
        mimeType,
        pageCount,
        hasExtractableText: textChars >= MIN_EXTRACTABLE_CHARS,
        encrypted: false,
      };
    } catch (error) {
      if (isPasswordError(error)) {
        throw new EncryptedPdfError();
      }
      throw new UnsupportedDocumentError('This PDF could not be read. It may be damaged.');
    }
  }

  const meta = await sharp(buffer).metadata();
  return {
    kind: 'image',
    mimeType,
    pageCount: 1,
    hasExtractableText: false,
    encrypted: false,
    width: meta.width,
    height: meta.height,
  };
}
