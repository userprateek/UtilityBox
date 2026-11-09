import { classifyDocument, EncryptedPdfError, UnsupportedDocumentError } from './classify';
import {
  infrastructureUserMessage,
  isInfrastructureError,
  StrategyContentError,
} from './errors';
import { extensionForMime } from './fileSignature';
import { MAX_STRATEGIES } from './limits';
import { getTranslationProvider } from './providers';
import { AITranslationProvider } from './providers/types';
import { attemptDirectAIProcessing } from './strategies/direct';
import { attemptExtractionTranslation, isExtractStrategyApplicable } from './strategies/extract';
import { attemptOCRTranslation } from './strategies/ocr';
import {
  ProgressReporter,
  StrategyAttempt,
  TranslationRequest,
  TranslationResult,
  TranslationStrategyId,
} from './types';

interface StrategyHandler {
  id: TranslationStrategyId;
  applicable: boolean;
  stageLabel: string;
  run: () => Promise<{ buffer: Buffer; mimeType: string; document: { sourceLanguage?: string; pages: unknown[] } }>;
}

export async function translateDocument(
  request: TranslationRequest,
  provider: AITranslationProvider = getTranslationProvider()
): Promise<TranslationResult> {
  const { buffer, mimeType, fileName, sourceLanguage, targetLanguage, onProgress } = request;
  const attempts: StrategyAttempt[] = [];

  let classified;
  try {
    onProgress?.({ type: 'stage', id: 'understanding', label: 'Understanding document' });
    classified = await classifyDocument(buffer, mimeType);
  } catch (error) {
    if (error instanceof EncryptedPdfError) {
      return { ok: false, code: 'encrypted', message: error.message, attempts };
    }
    if (error instanceof UnsupportedDocumentError) {
      return { ok: false, code: 'unsupported', message: error.message, attempts };
    }
    return {
      ok: false,
      code: 'unsupported',
      message: 'This document could not be opened.',
      attempts,
    };
  }

  const strategies: StrategyHandler[] = [
    {
      id: 'direct-ai',
      applicable: true,
      stageLabel: 'Translating with AI',
      run: () =>
        attemptDirectAIProcessing({
          buffer,
          classified,
          sourceLanguage,
          targetLanguage,
          provider,
        }),
    },
    {
      id: 'extract',
      applicable: isExtractStrategyApplicable(classified),
      stageLabel: 'Extracting content',
      run: () =>
        attemptExtractionTranslation({
          buffer,
          classified,
          sourceLanguage,
          targetLanguage,
          provider,
        }),
    },
    {
      id: 'ocr',
      applicable: true,
      stageLabel: 'Reading scanned text',
      run: () =>
        attemptOCRTranslation({
          buffer,
          classified,
          sourceLanguage,
          targetLanguage,
          provider,
        }),
    },
  ];

  let usedFallback = false;

  for (const strategy of strategies) {
    const executed = attempts.filter((attempt) => !attempt.skipped).length;
    if (executed >= MAX_STRATEGIES) break;

    if (!strategy.applicable) {
      attempts.push({
        strategy: strategy.id,
        startedAt: Date.now(),
        durationMs: 0,
        ok: false,
        skipped: true,
        failureReason: 'Not applicable for this document',
      });
      continue;
    }

    if (usedFallback) {
      onProgress?.({
        type: 'fallback',
        label: 'Trying an alternative processing method...',
      });
    }

    onProgress?.({ type: 'stage', id: strategy.id, label: strategy.stageLabel });
    if (strategy.id !== 'direct-ai') {
      onProgress?.({ type: 'stage', id: 'translating', label: 'Translating with AI' });
    }

    const startedAt = Date.now();
    try {
      const result = await strategy.run();
      onProgress?.({ type: 'stage', id: 'reconstructing', label: 'Reconstructing document' });
      onProgress?.({ type: 'stage', id: 'preparing', label: 'Preparing download' });

      attempts.push({
        strategy: strategy.id,
        startedAt,
        durationMs: Date.now() - startedAt,
        ok: true,
      });

      const ext = extensionForMime(result.mimeType);
      const base = fileName.replace(/\.[^.]+$/, '') || 'document';

      return {
        ok: true,
        buffer: result.buffer,
        mimeType: result.mimeType,
        fileName: `${base}_translated.${ext}`,
        strategy: strategy.id,
        attempts: attempts.filter((attempt) => !attempt.skipped),
        detectedSourceLanguage: result.document.sourceLanguage,
        pageCount: classified.pageCount,
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      if (isInfrastructureError(error)) {
        attempts.push({
          strategy: strategy.id,
          startedAt,
          durationMs,
          ok: false,
          failureReason: error.code,
        });
        return {
          ok: false,
          code: 'infrastructure',
          message: infrastructureUserMessage(error.code),
          attempts: attempts.filter((attempt) => !attempt.skipped),
        };
      }

      const reason =
        error instanceof StrategyContentError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unknown strategy failure';

      attempts.push({
        strategy: strategy.id,
        startedAt,
        durationMs,
        ok: false,
        failureReason: reason,
      });
      usedFallback = true;
    }
  }

  return {
    ok: false,
    code: 'untranslatable',
    message:
      "We couldn't translate this document successfully. The document may be unsupported or its content may not be extractable.",
    attempts: attempts.filter((attempt) => !attempt.skipped),
  };
}

export function createProgressLogger(): {
  events: Array<{ strategy?: string; reason?: string }>;
  reporter: ProgressReporter;
} {
  const events: Array<{ strategy?: string; reason?: string }> = [];
  return {
    events,
    reporter: (event) => {
      events.push({ strategy: event.id, reason: event.label });
    },
  };
}
