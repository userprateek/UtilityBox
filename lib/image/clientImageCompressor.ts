import imageCompression from 'browser-image-compression';
import { ImageCompressionOptions, ImageProcessorResult } from './types';
import {
  compressImageFile as canvasCompressImageFile,
  calculateTargetDimensions,
} from './canvasCompressor';
import { loadImageFromFile } from './canvasCropper';
import { resolveExplicitOutputFormat } from './outputFormat';

/**
 * High-performance client-side image compressor.
 * - For strict Target KB constraints (e.g. 20KB signatures, 50KB photos), uses our deterministic multi-pass canvas engine.
 * - For general quality scaling and large batches, utilizes browser-image-compression in Web Workers.
 */
export async function compressImageAdvanced(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<ImageProcessorResult> {
  const exactBox =
    options.scaleMode === 'custom' &&
    !!options.customWidth &&
    !!options.customHeight &&
    options.maintainAspectRatio === false;

  // Target-KB mode and exact width×height both need the canvas engine.
  // browser-image-compression only caps the longest side, so a 300×300
  // request on a 4:3 photo would come out 300×225.
  if ((options.targetMaxSizeBytes && options.targetMaxSizeBytes > 0) || exactBox) {
    return await canvasCompressImageFile(file, options);
  }

  try {
    const img = await loadImageFromFile(file);
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(
      naturalWidth,
      naturalHeight,
      options
    );

    // Explicit and "original" formats are resolved here. An omitted format keeps
    // the compressor default: WebP stays WebP, other photos encode as JPEG.
    const explicitFormat = resolveExplicitOutputFormat(file, options.outputFormat);
    const fileType = explicitFormat ?? (file.type === 'image/webp' ? 'image/webp' : 'image/jpeg');

    const maxDim = Math.max(targetWidth, targetHeight);
    const quality = options.quality ?? 0.8;

    const compressionOptions = {
      maxSizeMB: 50,
      maxWidthOrHeight: maxDim,
      useWebWorker: true,
      initialQuality: quality,
      fileType,
      alwaysKeepResolution: options.scaleMode === 'original',
      exifOrientation: options.keepMetadata ? 1 : -1,
    };

    const compressedBlob = await imageCompression(file, compressionOptions);

    return {
      blob: compressedBlob,
      width: targetWidth,
      height: targetHeight,
      size: compressedBlob.size,
      format: fileType,
    };
  } catch {
    // Fallback gracefully to built-in multi-pass Canvas engine
    return await canvasCompressImageFile(file, options);
  }
}
