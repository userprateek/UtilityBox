import { AnalyzeResult, TranslateContentInput, TranslatedDocument } from '../types';

export interface AITranslationProvider {
  readonly id: string;
  analyzeDocument(buffer: Buffer, mimeType: string, sourceLanguage: string, targetLanguage: string): Promise<AnalyzeResult>;
  analyzeImage(buffer: Buffer, mimeType: string, sourceLanguage: string, targetLanguage: string): Promise<AnalyzeResult>;
  translateContent(input: TranslateContentInput): Promise<TranslatedDocument>;
  getSupportedLanguages(): string[];
}
