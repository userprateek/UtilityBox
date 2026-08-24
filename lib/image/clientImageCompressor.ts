import imageCompression from 'browser-image-compression';
import { ImageCompressionOptions, ImageProcessorResult } from './types';
import {
  compressImageFile as canvasCompressImageFile,
  calculateTargetDimensions,
} from './canvasCompressor';
import { loadImageFromFile } from './canvasCropper';

/**
 * High-performance client-side image compressor.
 * - For strict Target KB constraints (e.g. 20KB signatures, 50KB photos), uses our deterministic multi-pass canvas engine.
 * - For general quality scaling and large batches, utilizes browser-image-compression in Web Workers.
 */
export async function compressImageAdvanced(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<ImageProcessorResult> {
  // If strict Target KB is requested (e.g. 20KB or 50KB or custom KB), use the deterministic canvas engine
  if (options.targetMaxSizeBytes && options.targetMaxSizeBytes > 0) {
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

    // Determine target format
    let fileType = 'image/jpeg';
    if (options.outputFormat === 'image/webp') {
      fileType = 'image/webp';
    } else if (options.outputFormat === 'image/png') {
      fileType = 'image/png';
    } else if (options.outputFormat === 'image/jpeg') {
      fileType = 'image/jpeg';
    } else {
      fileType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
    }

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
