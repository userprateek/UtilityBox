import { ProcessingStatus } from './tool';

export interface ManagedFile {
  id: string;
  originalFile: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  status: ProcessingStatus;
  progress: number;
  errorMessage?: string;
  processedBlob?: Blob;
  processedUrl?: string;
  processedSize?: number;
  metadata?: Record<string, unknown>;
}

export interface FileValidationRule {
  acceptMimeTypes?: string[];
  acceptExtensions?: string[];
  maxSizeBytes?: number;
  minSizeBytes?: number;
  maxFiles?: number;
}

export type FileValidationErrorCode =
  | 'INVALID_TYPE'
  | 'FILE_TOO_LARGE'
  | 'FILE_TOO_SMALL'
  | 'MAX_FILES_EXCEEDED'
  | 'DUPLICATE_FILE'
  | 'CORRUPTED_FILE';

export interface FileValidationError {
  code: FileValidationErrorCode;
  message: string;
  filename?: string;
}

export interface FileUploadResult {
  acceptedFiles: ManagedFile[];
  errors: FileValidationError[];
}
