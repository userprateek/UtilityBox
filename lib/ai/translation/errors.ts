export type InfrastructureCode =
  | 'missing_api_key'
  | 'invalid_api_key'
  | 'provider_unavailable'
  | 'network'
  | 'timeout'
  | 'rate_limited';

export class TranslationInfrastructureError extends Error {
  readonly code: InfrastructureCode;

  constructor(code: InfrastructureCode, message: string) {
    super(message);
    this.name = 'TranslationInfrastructureError';
    this.code = code;
  }
}

export class StrategyContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StrategyContentError';
  }
}

export function isInfrastructureError(error: unknown): error is TranslationInfrastructureError {
  return error instanceof TranslationInfrastructureError;
}

export function infrastructureUserMessage(code: InfrastructureCode): string {
  switch (code) {
    case 'missing_api_key':
    case 'invalid_api_key':
      return 'Translation is temporarily unavailable because the AI provider is not configured.';
    case 'provider_unavailable':
      return 'The AI translation service is unavailable right now. Please try again later.';
    case 'network':
      return 'We could not reach the AI translation service. Check your connection and try again.';
    case 'timeout':
      return 'The AI translation service took too long to respond. Try a smaller document.';
    case 'rate_limited':
      return 'Too many translation requests at the moment. Please wait a minute and try again.';
    default:
      return 'The AI translation service could not complete this request.';
  }
}
