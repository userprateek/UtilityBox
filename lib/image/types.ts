export type DimensionScaleMode = 'original' | 'percentage' | 'custom' | 'preset';
export type DimensionPreset =
  | 'passport' // 350 x 450 px (35x45mm)
  | 'passport_sq' // 600 x 600 px (2x2 inch)
  | 'signature' // 300 x 100 px (3:1)
  | 'signature_large' // 560 x 160 px (3.5:1)
  | 'postcard' // 1200 x 800 px (4x6)
  | 'hd' // 1280 x 720 px
  | 'fhd'; // 1920 x 1080 px

export interface ImageCompressionOptions {
  quality?: number; // 0.05 to 1.0
  scaleMode?: DimensionScaleMode;
  scalePercentage?: number; // 10 to 100
  customWidth?: number;
  customHeight?: number;
  maintainAspectRatio?: boolean;
  dimensionPreset?: DimensionPreset;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: 'original' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
  targetMaxSizeBytes?: number; // e.g. 20KB, 50KB, 100KB, 200KB, 500KB
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
