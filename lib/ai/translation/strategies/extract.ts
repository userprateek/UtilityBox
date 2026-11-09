import { StrategyContentError } from '../errors';
import { MIN_EXTRACTABLE_CHARS } from '../limits';
import { ClassifiedDocument, TranslatedDocument } from '../types';
import { AITranslationProvider } from '../providers/types';
import { extractPdfTextBlocks } from '../extract/pdfText';
import { rasterizeImage, rasterizePdfPages } from '../extract/rasterize';
import { reconstructOutput } from '../reconstruct/output';
import { validateOutputBuffer, validateTranslatedContent } from '../validateResult';

export function isExtractStrategyApplicable(classified: ClassifiedDocument): boolean {
  return classified.kind === 'pdf' && classified.hasExtractableText;
}

export async function attemptExtractionTranslation(options: {
  buffer: Buffer;
  classified: ClassifiedDocument;
  sourceLanguage: string;
  targetLanguage: string;
  provider: AITranslationProvider;
}): Promise<{ document: TranslatedDocument; buffer: Buffer; mimeType: string }> {
  const { buffer, classified, sourceLanguage, targetLanguage, provider } = options;

  if (!isExtractStrategyApplicable(classified)) {
    throw new StrategyContentError('Text extraction is not applicable for this document.');
  }

  const pages = await extractPdfTextBlocks(buffer);
  const extractedChars = pages
    .flatMap((page) => page.blocks)
    .reduce((sum, block) => sum + block.originalText.replace(/\s+/g, '').length, 0);

  if (extractedChars < MIN_EXTRACTABLE_CHARS) {
    throw new StrategyContentError('Not enough extractable text to translate.');
  }

  const document = await provider.translateContent({
    sourceLanguage,
    targetLanguage,
    pages,
    extraContext: 'Blocks were extracted from a digital PDF in reading order.',
  });

  validateTranslatedContent(document);

  const pageImages =
    classified.kind === 'pdf' ? await rasterizePdfPages(buffer) : [await rasterizeImage(buffer)];

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
