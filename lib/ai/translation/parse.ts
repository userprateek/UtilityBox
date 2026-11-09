import { StrategyContentError } from './errors';
import {
  BoundingBox,
  TextBlockType,
  TranslatedBlock,
  TranslatedDocument,
  TranslatedPage,
} from './types';

const BLOCK_TYPES: TextBlockType[] = [
  'heading',
  'paragraph',
  'table_cell',
  'list_item',
  'label',
  'other',
];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function parseBbox(value: unknown): BoundingBox {
  const rec = asRecord(value);
  const x = clamp01(Number(rec?.x ?? 0));
  const y = clamp01(Number(rec?.y ?? 0));
  const width = clamp01(Number(rec?.width ?? 0));
  const height = clamp01(Number(rec?.height ?? 0));
  return {
    x,
    y,
    width: width > 0 ? width : 0.4,
    height: height > 0 ? height : 0.04,
  };
}

function parseBlockType(value: unknown): TextBlockType {
  return BLOCK_TYPES.includes(value as TextBlockType) ? (value as TextBlockType) : 'other';
}

function parseBlock(value: unknown, fallbackId: string): TranslatedBlock | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const originalText = String(rec.originalText ?? rec.text ?? '').trim();
  const translatedText = String(rec.translatedText ?? rec.translation ?? '').trim();
  if (!translatedText && !originalText) return null;

  return {
    id: String(rec.id ?? fallbackId),
    type: parseBlockType(rec.type),
    originalText,
    translatedText: translatedText || originalText,
    uncertain: Boolean(rec.uncertain),
    bbox: parseBbox(rec.bbox ?? rec.boundingBox),
    fontSize: typeof rec.fontSize === 'number' ? rec.fontSize : undefined,
    color: typeof rec.color === 'string' ? rec.color : undefined,
    align:
      rec.align === 'center' || rec.align === 'right' || rec.align === 'left'
        ? rec.align
        : undefined,
  };
}

function parsePage(value: unknown, index: number): TranslatedPage | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const rawBlocks = Array.isArray(rec.blocks) ? rec.blocks : [];
  const blocks = rawBlocks
    .map((block, i) => parseBlock(block, `p${index + 1}-b${i + 1}`))
    .filter((block): block is TranslatedBlock => Boolean(block));

  return {
    pageNumber: Number(rec.pageNumber) || index + 1,
    width: Number(rec.width) > 0 ? Number(rec.width) : 595,
    height: Number(rec.height) > 0 ? Number(rec.height) : 842,
    blocks,
  };
}

export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new StrategyContentError('AI response was not valid JSON.');
  }
}

export function parseTranslatedDocument(raw: string): TranslatedDocument {
  let parsed: unknown;
  try {
    parsed = extractJsonObject(raw);
  } catch (error) {
    if (error instanceof StrategyContentError) throw error;
    throw new StrategyContentError('AI response was not valid JSON.');
  }

  const rec = asRecord(parsed);
  if (!rec) {
    throw new StrategyContentError('AI response did not contain a document object.');
  }

  const pagesSource = Array.isArray(rec.pages) ? rec.pages : [];
  const pages = pagesSource
    .map((page, index) => parsePage(page, index))
    .filter((page): page is TranslatedPage => Boolean(page));

  if (pages.length === 0) {
    throw new StrategyContentError('AI returned no pages.');
  }

  const totalBlocks = pages.reduce((sum, page) => sum + page.blocks.length, 0);
  if (totalBlocks === 0) {
    throw new StrategyContentError('AI returned no translatable text regions.');
  }

  return {
    sourceLanguage: String(rec.sourceLanguage || 'unknown'),
    targetLanguage: String(rec.targetLanguage || ''),
    pages,
  };
}
