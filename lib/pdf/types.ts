export interface PdfCompressionOptions {
  level: 'extreme' | 'recommended' | 'low';
  imageQuality?: number;
}

export interface PdfMergeOptions {
  files: File[];
  generateTableOfContents?: boolean;
}

export interface PdfSplitOptions {
  mode: 'all' | 'custom-ranges' | 'single-page';
  pageRanges?: string; // e.g. "1-3, 5, 8-10"
}

export interface PdfToImageOptions {
  format: 'image/jpeg' | 'image/png';
  dpi: 72 | 150 | 300;
  pageNumbers?: number[];
}

export interface PdfProcessorResult {
  blob: Blob;
  pageCount?: number;
  size: number;
  filename: string;
}

/**
 * Standard interface for client-side PDF processing engines
 */
export interface PdfProcessor {
  compress(file: File, options: PdfCompressionOptions): Promise<PdfProcessorResult>;
  merge(files: File[], options?: PdfMergeOptions): Promise<PdfProcessorResult>;
  split(file: File, options: PdfSplitOptions): Promise<PdfProcessorResult[]>;
  toImages(file: File, options: PdfToImageOptions): Promise<Blob[]>;
}
