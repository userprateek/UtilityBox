import { GoogleGenAI } from '@google/genai';
import { TRANSLATION_LANGUAGES } from '../languages';
import { DEFAULT_GEMINI_MODEL, MAX_NETWORK_RETRIES, REQUEST_TIMEOUT_MS } from '../limits';
import { parseTranslatedDocument } from '../parse';
import { buildBlockTranslationPrompt, buildDirectAnalysisPrompt } from '../prompts';
import { translatedDocumentSchema } from '../schema';
import { StrategyContentError, TranslationInfrastructureError } from '../errors';
import { AnalyzeResult, TranslateContentInput, TranslatedDocument } from '../types';
import { AITranslationProvider } from './types';

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new TranslationInfrastructureError(
      'missing_api_key',
      'GEMINI_API_KEY is not configured.'
    );
  }
  return key;
}

function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function classifyProviderError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number }).status;
  const lower = message.toLowerCase();

  if (lower.includes('api key') || status === 401 || status === 403) {
    throw new TranslationInfrastructureError('invalid_api_key', 'The AI provider rejected the API key.');
  }
  if (status === 429 || lower.includes('resource exhausted') || lower.includes('quota')) {
    throw new TranslationInfrastructureError('rate_limited', 'The AI provider rate-limited the request.');
  }
  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('deadline')) {
    throw new TranslationInfrastructureError('timeout', 'The AI provider timed out.');
  }
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('econnreset')) {
    throw new TranslationInfrastructureError('network', 'Network error talking to the AI provider.');
  }
  if (status && status >= 500) {
    throw new TranslationInfrastructureError('provider_unavailable', 'The AI provider returned a server error.');
  }
  throw new StrategyContentError(message || 'The AI provider returned an unusable response.');
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new TranslationInfrastructureError('timeout', 'The AI provider timed out.'));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export class GeminiTranslationProvider implements AITranslationProvider {
  readonly id = 'gemini';

  getSupportedLanguages(): string[] {
    return TRANSLATION_LANGUAGES.map((lang) => lang.code);
  }

  async analyzeDocument(
    buffer: Buffer,
    mimeType: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<AnalyzeResult> {
    return this.analyzeInline(buffer, mimeType, sourceLanguage, targetLanguage);
  }

  async analyzeImage(
    buffer: Buffer,
    mimeType: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<AnalyzeResult> {
    return this.analyzeInline(buffer, mimeType, sourceLanguage, targetLanguage);
  }

  async translateContent(input: TranslateContentInput): Promise<TranslatedDocument> {
    const payload = JSON.stringify({
      sourceLanguage: input.sourceLanguage,
      targetLanguage: input.targetLanguage,
      extraContext: input.extraContext ?? '',
      pages: input.pages,
    });

    const raw = await this.generateJson(
      buildBlockTranslationPrompt(input.sourceLanguage, input.targetLanguage),
      [{ text: payload }]
    );
    return parseTranslatedDocument(raw);
  }

  private async analyzeInline(
    buffer: Buffer,
    mimeType: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<AnalyzeResult> {
    const raw = await this.generateJson(buildDirectAnalysisPrompt(sourceLanguage, targetLanguage), [
      {
        inlineData: {
          mimeType,
          data: buffer.toString('base64'),
        },
      },
    ]);
    const document = parseTranslatedDocument(raw);
    return {
      document,
      detectedSourceLanguage: document.sourceLanguage,
    };
  }

  private async generateJson(
    systemPrompt: string,
    parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>
  ): Promise<string> {
    return this.generateText(systemPrompt, parts, true);
  }

  private async generateText(
    systemPrompt: string,
    parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>,
    json = false
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_NETWORK_RETRIES; attempt += 1) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: getModel(),
            contents: parts,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.2,
              maxOutputTokens: 16384,
              ...(json
                ? {
                    responseMimeType: 'application/json',
                    responseSchema: translatedDocumentSchema,
                  }
                : {}),
            },
          }),
          REQUEST_TIMEOUT_MS
        );

        const text = response.text?.trim();
        if (!text) {
          throw new StrategyContentError('The AI provider returned an empty response.');
        }
        return text;
      } catch (error) {
        if (error instanceof TranslationInfrastructureError) {
          const retryable =
            error.code === 'network' ||
            error.code === 'timeout' ||
            error.code === 'provider_unavailable' ||
            error.code === 'rate_limited';
          lastError = error;
          if (!retryable || attempt === MAX_NETWORK_RETRIES) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
          continue;
        }
        lastError = error;
        if (attempt === MAX_NETWORK_RETRIES) {
          classifyProviderError(error);
        }
      }
    }

    classifyProviderError(lastError);
  }
}
