export type TranslationStrategyId = 'direct-ai' | 'extract' | 'ocr';

export type DocumentKind = 'pdf' | 'image';

export type TextBlockType =
  | 'heading'
  | 'paragraph'
  | 'table_cell'
  | 'list_item'
  | 'label'
  | 'other';

export interface BoundingBox {
  /** Normalized 0–1, origin top-left of the page/image. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TranslatedBlock {
  id: string;
  type: TextBlockType;
  originalText: string;
  translatedText: string;
  uncertain: boolean;
  bbox: BoundingBox;
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TranslatedPage {
  pageNumber: number;
  width: number;
  height: number;
  blocks: TranslatedBlock[];
}

export interface TranslatedDocument {
  sourceLanguage: string;
  targetLanguage: string;
  pages: TranslatedPage[];
}

export interface ClassifiedDocument {
  kind: DocumentKind;
  mimeType: string;
  pageCount: number;
  hasExtractableText: boolean;
  encrypted: boolean;
  width?: number;
  height?: number;
}

export interface StrategyAttempt {
  strategy: TranslationStrategyId;
  startedAt: number;
  durationMs: number;
  ok: boolean;
  failureReason?: string;
  skipped?: boolean;
}

export interface TranslationProgressEvent {
  type: 'stage' | 'fallback';
  id?: string;
  label: string;
}

export type ProgressReporter = (event: TranslationProgressEvent) => void;

export interface TranslationRequest {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  sourceLanguage: string;
  targetLanguage: string;
  onProgress?: ProgressReporter;
}

export interface TranslationSuccess {
  ok: true;
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  strategy: TranslationStrategyId;
  attempts: StrategyAttempt[];
  detectedSourceLanguage?: string;
  pageCount: number;
}

export interface TranslationFailure {
  ok: false;
  code: 'unsupported' | 'encrypted' | 'invalid_file' | 'infrastructure' | 'untranslatable';
  message: string;
  attempts: StrategyAttempt[];
}

export type TranslationResult = TranslationSuccess | TranslationFailure;

export interface AnalyzeResult {
  document: TranslatedDocument;
  detectedSourceLanguage?: string;
}

export interface TranslateContentInput {
  sourceLanguage: string;
  targetLanguage: string;
  pages: Array<{
    pageNumber: number;
    width: number;
    height: number;
    blocks: Array<{
      id: string;
      type: TextBlockType;
      originalText: string;
      bbox: BoundingBox;
    }>;
  }>;
  extraContext?: string;
}
