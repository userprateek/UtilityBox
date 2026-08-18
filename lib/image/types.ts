export interface ImageCompressionOptions {
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
  keepMetadata?: boolean;
}

export interface ImageResizeOptions {
  mode: 'exact' | 'percentage' | 'aspect-ratio';
  width?: number;
  height?: number;
  percentage?: number;
  maintainAspectRatio: boolean;
  algorithm?: 'lanczos3' | 'bilinear' | 'bicubic';
}

export interface ImageConvertOptions {
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' | 'image/gif';
  quality?: number;
  backgroundColor?: string;
}

export interface ImageCropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: 'px' | '%';
}

export interface ImageProcessorResult {
  blob: Blob;
  width: number;
  height: number;
  size: number;
  format: string;
}

/**
 * Standard interface for client-side image processing engines
 */
export interface ImageProcessor {
  compress(file: File, options: ImageCompressionOptions): Promise<ImageProcessorResult>;
  resize(file: File, options: ImageResizeOptions): Promise<ImageProcessorResult>;
  convert(file: File, options: ImageConvertOptions): Promise<ImageProcessorResult>;
  crop(file: File, options: ImageCropOptions): Promise<ImageProcessorResult>;
}
