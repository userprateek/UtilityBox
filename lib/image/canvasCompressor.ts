import { ImageCompressionOptions, ImageProcessorResult } from './types';
import { loadImageFromFile } from './canvasCropper';

/**
 * Compresses an image file locally in the browser using HTML5 Canvas & Blob conversion.
 * 100% private - zero server transmission.
 */
export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions
): Promise<ImageProcessorResult> {
  const img = await loadImageFromFile(file);
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  let targetWidth = naturalWidth;
  let targetHeight = naturalHeight;

  if (options.maxWidth && targetWidth > options.maxWidth) {
    const ratio = options.maxWidth / targetWidth;
    targetWidth = options.maxWidth;
    targetHeight = Math.round(targetHeight * ratio);
  }

  if (options.maxHeight && targetHeight > options.maxHeight) {
    const ratio = options.maxHeight / targetHeight;
    targetHeight = options.maxHeight;
    targetWidth = Math.round(targetWidth * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, targetWidth);
  canvas.height = Math.max(1, targetHeight);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not supported in this browser.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Determine export format
  const format =
    options.outputFormat === 'image/jpeg' ||
    options.outputFormat === 'image/webp' ||
    options.outputFormat === 'image/png'
      ? options.outputFormat
      : file.type.startsWith('image/png')
        ? 'image/png'
        : 'image/jpeg';

  // Fill white background for JPEG exports if transparency exists
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image.'));
          return;
        }

        resolve({
          blob,
          width: targetWidth,
          height: targetHeight,
          size: blob.size,
          format,
        });
      },
      format,
      Math.min(1.0, Math.max(0.1, options.quality))
    );
  });
}
