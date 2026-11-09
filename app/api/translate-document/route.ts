import { NextRequest } from 'next/server';
import { translateDocument } from '@/lib/ai/translation/orchestrator';
import { TranslationProgressEvent } from '@/lib/ai/translation/types';
import { validateTranslationInput } from '@/lib/ai/translation/validateInput';

export const runtime = 'nodejs';
export const maxDuration = 60;

function encodeEvent(event: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  const sourceLanguage = String(formData.get('sourceLanguage') || 'auto');
  const targetLanguage = String(formData.get('targetLanguage') || 'en');

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ type: 'error', message: 'Upload a PDF or image to translate.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const claimedMime = file.type || 'application/octet-stream';

  const validationError = await validateTranslationInput({
    buffer,
    fileName: file.name,
    claimedMime,
    sourceLanguage,
    targetLanguage,
  });

  if (validationError) {
    return new Response(
      JSON.stringify({
        type: 'error',
        code: validationError.code,
        message: validationError.message,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encodeEvent(event));
      };

      const onProgress = (event: TranslationProgressEvent) => {
        send({ ...event });
      };

      try {
        const result = await translateDocument({
          buffer,
          mimeType: claimedMime,
          fileName: file.name,
          sourceLanguage,
          targetLanguage,
          onProgress,
        });

        if (!result.ok) {
          send({
            type: 'error',
            code: result.code,
            message: result.message,
            attempts: result.attempts.map((attempt) => ({
              strategy: attempt.strategy,
              ok: attempt.ok,
              durationMs: attempt.durationMs,
            })),
          });
          controller.close();
          return;
        }

        send({
          type: 'done',
          mimeType: result.mimeType,
          fileName: result.fileName,
          strategy: result.strategy,
          pageCount: result.pageCount,
          detectedSourceLanguage: result.detectedSourceLanguage,
          data: result.buffer.toString('base64'),
        });
        controller.close();
      } catch (error) {
        send({
          type: 'error',
          code: 'infrastructure',
          message: error instanceof Error ? error.message : 'Translation failed.',
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
