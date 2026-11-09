import { StrategyContentError } from '../errors';
import { MIN_EXTRACTABLE_CHARS } from '../limits';
import { ClassifiedDocument, TranslatedDocument } from '../types';
import { AITranslationProvider } from '../providers/types';
import { ocrPages } from '../extract/ocr';
import { rasterizeImage, rasterizePdfPages } from '../extract/rasterize';
import { reconstructOutput } from '../reconstruct/output';
import { validateOutputBuffer, validateTranslatedContent } from '../validateResult';

export async function attemptOCRTranslation(options: {
  buffer: Buffer;
  classified: ClassifiedDocument;
  sourceLanguage: string;
  targetLanguage: string;
  provider: AITranslationProvider;
}): Promise<{ document: TranslatedDocument; buffer: Buffer; mimeType: string }> {
  const { buffer, classified, sourceLanguage, targetLanguage, provider } = options;

  const pageImages =
    classified.kind === 'pdf' ? await rasterizePdfPages(buffer) : [await rasterizeImage(buffer)];

  const pages = await ocrPages(pageImages, sourceLanguage);
  const extractedChars = pages
    .flatMap((page) => page.blocks)
    .reduce((sum, block) => sum + block.originalText.replace(/\s+/g, '').length, 0);

  if (extractedChars < MIN_EXTRACTABLE_CHARS) {
    throw new StrategyContentError('OCR could not read enough text from this document.');
  }

  const document = await provider.translateContent({
    sourceLanguage,
    targetLanguage,
    pages,
    extraContext: 'Blocks were recognized with OCR. Use neighbouring regions for context.',
  });

  validateTranslatedContent(document);

  const output = await reconstructOutput({
    classified,
    originalBuffer: buffer,
    originalMime: classified.mimeType,
    document,
    pageImages,
    targetLanguage,
  });

  await validateOutputBuffer(output.buffer, output.mimeType);
  return { document, ...output };
}
