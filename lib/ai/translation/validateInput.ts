import { TranslationFailure } from './types';
import { detectFileKind } from './fileSignature';
import { MAX_FILE_BYTES, MAX_PDF_PAGES } from './limits';
import { isSupportedLanguage } from './languages';
import { classifyDocument, EncryptedPdfError, UnsupportedDocumentError } from './classify';

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);

export async function validateTranslationInput(options: {
  buffer: Buffer;
  fileName: string;
  claimedMime: string;
  sourceLanguage: string;
  targetLanguage: string;
}): Promise<TranslationFailure | null> {
  const { buffer, fileName, claimedMime, sourceLanguage, targetLanguage } = options;

  if (!isSupportedLanguage(sourceLanguage) || !isSupportedLanguage(targetLanguage) || targetLanguage === 'auto') {
    return {
      ok: false,
      code: 'invalid_file',
      message: 'Choose a supported target language.',
      attempts: [],
    };
  }

  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      code: 'unsupported',
      message: 'Upload a PDF, JPG, JPEG, PNG, or WebP file.',
      attempts: [],
    };
  }

  if (buffer.length === 0) {
    return {
      ok: false,
      code: 'invalid_file',
      message: 'The uploaded file is empty.',
      attempts: [],
    };
  }

  if (buffer.length > MAX_FILE_BYTES) {
    return {
      ok: false,
      code: 'invalid_file',
      message: `Files must be ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB or smaller.`,
      attempts: [],
    };
  }

  const kind = detectFileKind(buffer);
  if (kind === 'unknown') {
    return {
      ok: false,
      code: 'unsupported',
      message: 'This file is not a supported PDF or image.',
      attempts: [],
    };
  }

  try {
    const classified = await classifyDocument(buffer, claimedMime);
    if (classified.kind === 'pdf' && classified.pageCount > MAX_PDF_PAGES) {
      return {
        ok: false,
        code: 'invalid_file',
        message: `PDFs can have at most ${MAX_PDF_PAGES} pages.`,
        attempts: [],
      };
    }
  } catch (error) {
    if (error instanceof EncryptedPdfError) {
      return { ok: false, code: 'encrypted', message: error.message, attempts: [] };
    }
    if (error instanceof UnsupportedDocumentError) {
      return { ok: false, code: 'unsupported', message: error.message, attempts: [] };
    }
    return {
      ok: false,
      code: 'unsupported',
      message: 'This document could not be opened.',
      attempts: [],
    };
  }

  return null;
}
