/**
 * Live Gemini strategy runner. Not a mock and not part of Jest.
 * Loads the API key from the process environment. Never prints it.
 */
import fs from 'fs';
import path from 'path';
import { classifyDocument } from '@/lib/ai/translation/classify';
import { getTranslationProvider } from '@/lib/ai/translation/providers';
import { attemptDirectAIProcessing } from '@/lib/ai/translation/strategies/direct';
import { attemptExtractionTranslation } from '@/lib/ai/translation/strategies/extract';
import { attemptOCRTranslation } from '@/lib/ai/translation/strategies/ocr';
import { ClassifiedDocument, TranslatedDocument } from '@/lib/ai/translation/types';
import {
  buildLiveMultipagePdf,
  errorSummary,
  inspectOutputPdf,
  LIVE_PAGE_TEXT,
  translatedTextSummary,
  writeLiveReport,
} from './multipagePdf';

type StrategyId = 'direct-ai' | 'extract' | 'ocr';

async function runStrategy(
  id: StrategyId,
  buffer: Buffer,
  classified: ClassifiedDocument,
  run: () => Promise<{ buffer: Buffer; mimeType: string; document: TranslatedDocument }>
) {
  const started = Date.now();
  try {
    const output = await run();
    const text = translatedTextSummary(output.document);
    const pdf = await inspectOutputPdf(output.buffer);
    const dest = path.join(process.cwd(), '.local/testing/evidence/outputs/document-translator', `${id}.pdf`);
    fs.writeFileSync(dest, output.buffer);
    const problems: string[] = [];
    if (output.mimeType !== 'application/pdf') problems.push(`mime ${output.mimeType}`);
    if (!pdf.opened) problems.push('pdf did not open');
    if (pdf.pageCount !== LIVE_PAGE_TEXT.length) problems.push(`pages ${pdf.pageCount}`);
    if (text.blockCount < 1) problems.push('no translated blocks');
    if (!text.devanagari) problems.push('model text has no Devanagari');
    if (!pdf.devanagari) problems.push('rendered PDF OCR has no Devanagari');
    if (pdf.englishMarkers.length > 0) {
      problems.push(`source English still visible: ${pdf.englishMarkers.join(', ')}`);
    }
    const record = {
      strategy: id,
      ok: problems.length === 0,
      durationMs: Date.now() - started,
      mimeType: output.mimeType,
      modelText: text,
      pdf,
      problems,
    };
    console.log(
      `${id} ${record.ok ? 'PASS' : 'FAIL'} ${record.durationMs}ms pages=${pdf.pageCount} modelDevanagari=${text.devanagari} pdfDevanagari=${pdf.devanagari}${
        problems.length ? ` ${problems.join('; ')}` : ''
      }`
    );
    return record;
  } catch (error) {
    const record = {
      strategy: id,
      ok: false,
      durationMs: Date.now() - started,
      error: errorSummary(error),
    };
    console.log(`${id} FAIL ${record.durationMs}ms ${record.error}`);
    return record;
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error('GEMINI_API_KEY is not loaded. Refusing to treat a missing key as a pass.');
  }

  const buffer = await buildLiveMultipagePdf();
  const outDir = path.join(process.cwd(), '.local/testing/evidence/outputs/document-translator');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'source-multipage.pdf'), buffer);

  const classified = await classifyDocument(buffer, 'application/pdf');
  if (classified.pageCount !== LIVE_PAGE_TEXT.length || !classified.hasExtractableText) {
    throw new Error(
      `Input classification failed: pages=${classified.pageCount} extractable=${classified.hasExtractableText}`
    );
  }
  console.log(`classified pages=${classified.pageCount} extractable=${classified.hasExtractableText}`);

  const provider = getTranslationProvider();
  const shared = { buffer, classified, sourceLanguage: 'en', targetLanguage: 'hi', provider };
  const results = [];
  results.push(
    await runStrategy('direct-ai', buffer, classified, () => attemptDirectAIProcessing(shared))
  );
  results.push(
    await runStrategy('extract', buffer, classified, () => attemptExtractionTranslation(shared))
  );
  results.push(await runStrategy('ocr', buffer, classified, () => attemptOCRTranslation(shared)));

  writeLiveReport('live-strategies.json', {
    executedAt: new Date().toISOString(),
    model: process.env.GEMINI_MODEL || 'default',
    sourceLanguage: 'en',
    targetLanguage: 'hi',
    inputPages: LIVE_PAGE_TEXT.length,
    results,
  });

  if (results.some((result) => !result.ok)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(errorSummary(error));
  process.exit(1);
});
