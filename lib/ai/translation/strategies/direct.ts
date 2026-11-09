import { ClassifiedDocument, TranslatedDocument } from '../types';
import { AITranslationProvider } from '../providers/types';
import { rasterizeImage, rasterizePdfPages } from '../extract/rasterize';
import { reconstructOutput } from '../reconstruct/output';
import { validateOutputBuffer, validateTranslatedContent } from '../validateResult';

export async function attemptDirectAIProcessing(options: {
  buffer: Buffer;
  classified: ClassifiedDocument;
  sourceLanguage: string;
  targetLanguage: string;
  provider: AITranslationProvider;
}): Promise<{ document: TranslatedDocument; buffer: Buffer; mimeType: string }> {
  const { buffer, classified, sourceLanguage, targetLanguage, provider } = options;

  const analyzed =
    classified.kind === 'pdf'
      ? await provider.analyzeDocument(buffer, classified.mimeType, sourceLanguage, targetLanguage)
      : await provider.analyzeImage(buffer, classified.mimeType, sourceLanguage, targetLanguage);

  validateTranslatedContent(analyzed.document);

  const pageImages =
    classified.kind === 'pdf' ? await rasterizePdfPages(buffer) : [await rasterizeImage(buffer)];

  const output = await reconstructOutput({
    classified,
    originalBuffer: buffer,
    originalMime: classified.mimeType,
    document: analyzed.document,
    pageImages,
    targetLanguage,
  });

  await validateOutputBuffer(output.buffer, output.mimeType);
  return { document: analyzed.document, ...output };
}
