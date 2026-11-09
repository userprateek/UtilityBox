import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { StrategyContentError } from './errors';
import { MIN_TRANSLATED_CHARS } from './limits';
import { TranslatedDocument } from './types';

export function validateTranslatedContent(document: TranslatedDocument): void {
  const translated = document.pages
    .flatMap((page) => page.blocks)
    .map((block) => block.translatedText.trim())
    .filter(Boolean);

  if (translated.length === 0) {
    throw new StrategyContentError('No translated text was produced.');
  }

  const charCount = translated.join(' ').length;
  if (charCount < MIN_TRANSLATED_CHARS) {
    throw new StrategyContentError('Translated content was too short to be usable.');
  }
}

export async function validateOutputBuffer(buffer: Buffer, mimeType: string): Promise<void> {
  if (buffer.length < 32) {
    throw new StrategyContentError('Generated output was empty.');
  }

  if (mimeType === 'application/pdf') {
    if (!buffer.subarray(0, 5).toString('ascii').startsWith('%PDF')) {
      throw new StrategyContentError('Generated PDF is not valid.');
    }
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    if (pdf.getPageCount() < 1) {
      throw new StrategyContentError('Generated PDF has no pages.');
    }
    return;
  }

  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) {
      throw new StrategyContentError('Generated image has no dimensions.');
    }
  } catch {
    throw new StrategyContentError('Generated image is not valid.');
  }
}
