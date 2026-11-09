import { ImageCompressionOptions } from './types';

const PRESERVED_SOURCE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function sourceRasterType(file: File): string | undefined {
  const type = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  return PRESERVED_SOURCE_TYPES.has(type) ? type : undefined;
}

/**
 * Explicit JPEG/PNG/WebP choices, or the source type when the caller asked
 * to keep the original format. Returns undefined when no format was chosen
 * so existing compressor defaults stay unchanged.
 */
export function resolveExplicitOutputFormat(
  file: File,
  outputFormat: ImageCompressionOptions['outputFormat'] | undefined
): string | undefined {
  if (
    outputFormat === 'image/jpeg' ||
    outputFormat === 'image/png' ||
    outputFormat === 'image/webp'
  ) {
    return outputFormat;
  }

  if (outputFormat === 'original') {
    return sourceRasterType(file) ?? 'image/jpeg';
  }

  return undefined;
}
