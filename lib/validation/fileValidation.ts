import { FileValidationRule, FileValidationError, ManagedFile } from '@/types/file';

const MIME_EXTENSION_MAP: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  'image/gif': ['.gif'],
  'image/avif': ['.avif'],
  'image/bmp': ['.bmp'],
  'application/pdf': ['.pdf'],
  'application/json': ['.json'],
  'text/plain': ['.txt'],
};

/**
 * Validates an incoming list of files against tool-specific validation rules.
 */
export function validateFiles(
  incomingFiles: File[],
  rules: FileValidationRule,
  existingFiles: ManagedFile[] = []
): { validFiles: File[]; errors: FileValidationError[] } {
  const validFiles: File[] = [];
  const errors: FileValidationError[] = [];

  const maxFiles = rules.maxFiles ?? 50;
  const currentTotal = existingFiles.length;

  if (currentTotal + incomingFiles.length > maxFiles) {
    errors.push({
      code: 'MAX_FILES_EXCEEDED',
      message: `You can upload a maximum of ${maxFiles} file${maxFiles > 1 ? 's' : ''} for this tool.`,
    });
  }

  const existingFileKeys = new Set(
    existingFiles.map((f) => `${f.name}-${f.size}-${f.originalFile.lastModified}`)
  );

  const filesToProcess = incomingFiles.slice(0, Math.max(0, maxFiles - currentTotal));

  for (const file of filesToProcess) {
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

    // Check duplicates
    if (existingFileKeys.has(fileKey)) {
      errors.push({
        code: 'DUPLICATE_FILE',
        message: `File "${file.name}" has already been added.`,
        filename: file.name,
      });
      continue;
    }

    // Check max file size
    if (rules.maxSizeBytes && file.size > rules.maxSizeBytes) {
      const maxMb = (rules.maxSizeBytes / (1024 * 1024)).toFixed(0);
      errors.push({
        code: 'FILE_TOO_LARGE',
        message: `File "${file.name}" exceeds the maximum allowed size of ${maxMb}MB.`,
        filename: file.name,
      });
      continue;
    }

    // Check min file size (e.g. empty 0 byte files)
    if (file.size === 0 || (rules.minSizeBytes && file.size < rules.minSizeBytes)) {
      errors.push({
        code: 'FILE_TOO_SMALL',
        message: `File "${file.name}" is empty or too small.`,
        filename: file.name,
      });
      continue;
    }

    // Check MIME type / extension acceptance (with Windows/mobile empty MIME fallback)
    if (rules.acceptMimeTypes && rules.acceptMimeTypes.length > 0) {
      const isWildcard = rules.acceptMimeTypes.includes('*/*');
      const dotIndex = file.name.lastIndexOf('.');
      const fileExt = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : '';

      // Check MIME type match
      const matchesMime = Boolean(
        file.type &&
        rules.acceptMimeTypes.some((type) => {
          if (type.endsWith('/*')) {
            const prefix = type.split('/')[0];
            return file.type.startsWith(`${prefix}/`);
          }
          return file.type === type;
        })
      );

      // Check explicit rules.acceptExtensions
      const matchesExplicitExt = Boolean(
        rules.acceptExtensions &&
        rules.acceptExtensions.some((e) => {
          const normalized = e.startsWith('.') ? e.toLowerCase() : `.${e.toLowerCase()}`;
          return normalized === fileExt;
        })
      );

      // Fallback: Check inferred extensions from acceptMimeTypes
      const matchesInferredExt = Boolean(
        fileExt &&
        rules.acceptMimeTypes.some((type) => {
          if (type.endsWith('/*')) {
            const prefix = type.split('/')[0];
            if (prefix === 'image') {
              return ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif', '.bmp'].includes(
                fileExt
              );
            }
            return false;
          }
          const extensions = MIME_EXTENSION_MAP[type];
          return extensions ? extensions.includes(fileExt) : false;
        })
      );

      if (!isWildcard && !matchesMime && !matchesExplicitExt && !matchesInferredExt) {
        errors.push({
          code: 'INVALID_TYPE',
          message: `File "${file.name}" format is not supported for this tool.`,
          filename: file.name,
        });
        continue;
      }
    }

    existingFileKeys.add(fileKey);
    validFiles.push(file);
  }

  return { validFiles, errors };
}
