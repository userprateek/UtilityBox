import { translateDocument } from './orchestrator';
import { TranslationInfrastructureError } from './errors';
import { ClassifiedDocument } from './types';
import { AITranslationProvider } from './providers/types';

jest.mock('./providers', () => ({
  getTranslationProvider: jest.fn(),
}));

jest.mock('./classify', () => ({
  classifyDocument: jest.fn(),
  EncryptedPdfError: class EncryptedPdfError extends Error {
    constructor() {
      super('encrypted');
      this.name = 'EncryptedPdfError';
    }
  },
  UnsupportedDocumentError: class UnsupportedDocumentError extends Error {
    constructor(message?: string) {
      super(message);
      this.name = 'UnsupportedDocumentError';
    }
  },
}));

jest.mock('./strategies/direct', () => ({
  attemptDirectAIProcessing: jest.fn(),
}));

jest.mock('./strategies/extract', () => ({
  isExtractStrategyApplicable: jest.fn(),
  attemptExtractionTranslation: jest.fn(),
}));

jest.mock('./strategies/ocr', () => ({
  attemptOCRTranslation: jest.fn(),
}));

import { classifyDocument } from './classify';
import { attemptDirectAIProcessing } from './strategies/direct';
import { attemptExtractionTranslation, isExtractStrategyApplicable } from './strategies/extract';
import { attemptOCRTranslation } from './strategies/ocr';

const classifiedPdf: ClassifiedDocument = {
  kind: 'pdf',
  mimeType: 'application/pdf',
  pageCount: 1,
  hasExtractableText: true,
  encrypted: false,
};

const provider = {
  id: 'mock',
  analyzeDocument: jest.fn(),
  analyzeImage: jest.fn(),
  translateContent: jest.fn(),
  getSupportedLanguages: jest.fn(() => ['en', 'hi']),
} as unknown as AITranslationProvider;

const success = {
  document: { sourceLanguage: 'en', targetLanguage: 'hi', pages: [{ pageNumber: 1, width: 100, height: 100, blocks: [] }] },
  buffer: Buffer.from('%PDF-1.4 mock'),
  mimeType: 'application/pdf',
};

describe('DocumentTranslationOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (classifyDocument as jest.Mock).mockResolvedValue(classifiedPdf);
    (isExtractStrategyApplicable as jest.Mock).mockReturnValue(true);
  });

  it('uses AI via the first successful strategy and does not continue', async () => {
    (attemptDirectAIProcessing as jest.Mock).mockResolvedValue(success);

    const result = await translateDocument(
      {
        buffer: Buffer.from('%PDF-1.4'),
        mimeType: 'application/pdf',
        fileName: 'letter.pdf',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
      },
      provider
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.strategy).toBe('direct-ai');
      expect(result.mimeType).toBe('application/pdf');
    }
    expect(attemptExtractionTranslation).not.toHaveBeenCalled();
    expect(attemptOCRTranslation).not.toHaveBeenCalled();
  });

  it('falls back at most twice after a content failure, then OCR', async () => {
    (attemptDirectAIProcessing as jest.Mock).mockRejectedValue(new Error('empty layout'));
    (attemptExtractionTranslation as jest.Mock).mockRejectedValue(new Error('no blocks'));
    (attemptOCRTranslation as jest.Mock).mockResolvedValue(success);

    const result = await translateDocument(
      {
        buffer: Buffer.from('%PDF-1.4'),
        mimeType: 'application/pdf',
        fileName: 'scan.pdf',
        sourceLanguage: 'en',
        targetLanguage: 'es',
      },
      provider
    );

    expect(attemptDirectAIProcessing).toHaveBeenCalledTimes(1);
    expect(attemptExtractionTranslation).toHaveBeenCalledTimes(1);
    expect(attemptOCRTranslation).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.strategy).toBe('ocr');
  });

  it('stops on infrastructure errors instead of running OCR', async () => {
    (attemptDirectAIProcessing as jest.Mock).mockRejectedValue(
      new TranslationInfrastructureError('invalid_api_key', 'bad key')
    );

    const result = await translateDocument(
      {
        buffer: Buffer.from('%PDF-1.4'),
        mimeType: 'application/pdf',
        fileName: 'letter.pdf',
        sourceLanguage: 'auto',
        targetLanguage: 'hi',
      },
      provider
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('infrastructure');
      expect(result.message).toMatch(/not configured|unavailable|provider/i);
    }
    expect(attemptExtractionTranslation).not.toHaveBeenCalled();
    expect(attemptOCRTranslation).not.toHaveBeenCalled();
  });

  it('skips extraction for images and still bounds to three strategies', async () => {
    (classifyDocument as jest.Mock).mockResolvedValue({
      kind: 'image',
      mimeType: 'image/png',
      pageCount: 1,
      hasExtractableText: false,
      encrypted: false,
    });
    (isExtractStrategyApplicable as jest.Mock).mockReturnValue(false);
    (attemptDirectAIProcessing as jest.Mock).mockRejectedValue(new Error('no regions'));
    (attemptOCRTranslation as jest.Mock).mockRejectedValue(new Error('illegible'));

    const result = await translateDocument(
      {
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
        mimeType: 'image/png',
        fileName: 'photo.png',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
      },
      provider
    );

    expect(attemptExtractionTranslation).not.toHaveBeenCalled();
    expect(attemptDirectAIProcessing).toHaveBeenCalledTimes(1);
    expect(attemptOCRTranslation).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('untranslatable');
  });
});
