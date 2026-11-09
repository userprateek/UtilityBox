import { TranslationInfrastructureError } from '../errors';
import { GeminiTranslationProvider } from './gemini';
import { AITranslationProvider } from './types';

export function getTranslationProvider(): AITranslationProvider {
  const id = process.env.TRANSLATION_AI_PROVIDER?.trim() || 'gemini';
  if (id === 'gemini') {
    return new GeminiTranslationProvider();
  }
  throw new TranslationInfrastructureError(
    'provider_unavailable',
    `Unknown translation provider: ${id}`
  );
}

export type { AITranslationProvider } from './types';
