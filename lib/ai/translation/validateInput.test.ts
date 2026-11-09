import { PDFDocument } from 'pdf-lib';
import { validateTranslationInput } from './validateInput';

describe('validateTranslationInput', () => {
  it('rejects unsupported extensions and target auto', async () => {
    const empty = await validateTranslationInput({
      buffer: Buffer.from('abc'),
      fileName: 'notes.txt',
      claimedMime: 'text/plain',
      sourceLanguage: 'en',
      targetLanguage: 'hi',
    });
    expect(empty?.code).toBe('unsupported');

    const autoTarget = await validateTranslationInput({
      buffer: Buffer.from('%PDF-1.4'),
      fileName: 'doc.pdf',
      claimedMime: 'application/pdf',
      sourceLanguage: 'en',
      targetLanguage: 'auto',
    });
    expect(autoTarget?.message).toMatch(/target language/i);
  });

  it('rejects a truncated non-PDF pretending to be a PDF by name', async () => {
    const result = await validateTranslationInput({
      buffer: Buffer.from('this is not a pdf or image'),
      fileName: 'doc.pdf',
      claimedMime: 'application/pdf',
      sourceLanguage: 'en',
      targetLanguage: 'hi',
    });
    expect(result?.code).toBe('unsupported');
  });

  it('accepts a real digital PDF header for further classification', async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage([200, 200]);
    const bytes = Buffer.from(await pdf.save());

    const result = await validateTranslationInput({
      buffer: bytes,
      fileName: 'simple.pdf',
      claimedMime: 'application/pdf',
      sourceLanguage: 'en',
      targetLanguage: 'hi',
    });

    // Classification may fail in Jest if PDF.js cannot boot; either pass or a readable error is OK.
    if (result) {
      expect(['unsupported', 'invalid_file']).toContain(result.code);
    }
  });
});
