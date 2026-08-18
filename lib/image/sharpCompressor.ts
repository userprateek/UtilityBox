import sharp from 'sharp';
import { ImageCompressionOptions, DimensionPreset } from './types';
import { DIMENSION_PRESETS } from './canvasCompressor';

export interface SharpProcessResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Server-side high-performance image compression and manipulation engine powered by sharp (libvips).
 * Supports:
 * - MozJPEG with trellis quantization
 * - 8-bit PNG palette lossy quantization (pngquant)
 * - WebP & AVIF next-gen encoding
 * - Lanczos3 kernel resampling
 * - Exact Target KB binary search
 */
export async function processImageWithSharp(
  inputBuffer: Buffer,
  options: ImageCompressionOptions = {}
): Promise<SharpProcessResult> {
  const metadata = await sharp(inputBuffer).metadata();

  const naturalWidth = metadata.width || 1000;
  const naturalHeight = metadata.height || 1000;

  // Calculate dimensions
  let targetWidth: number | undefined;
  let targetHeight: number | undefined;

  const {
    scaleMode = 'original',
    scalePercentage = 100,
    dimensionPreset,
    customWidth,
    customHeight,
    maintainAspectRatio = true,
    targetMaxSizeBytes,
  } = options;

  if (scaleMode === 'percentage') {
    const pct = Math.max(1, Math.min(100, scalePercentage)) / 100;
    targetWidth = Math.round(naturalWidth * pct);
    targetHeight = Math.round(naturalHeight * pct);
  } else if (scaleMode === 'preset' && dimensionPreset && DIMENSION_PRESETS[dimensionPreset as DimensionPreset]) {
    const preset = DIMENSION_PRESETS[dimensionPreset as DimensionPreset];
    if (maintainAspectRatio) {
      const scale = Math.min(preset.width / naturalWidth, preset.height / naturalHeight);
      targetWidth = Math.round(naturalWidth * scale);
      targetHeight = Math.round(naturalHeight * scale);
    } else {
      targetWidth = preset.width;
      targetHeight = preset.height;
    }
  } else if (scaleMode === 'custom') {
    if (customWidth && customHeight) {
      if (maintainAspectRatio) {
        const scale = Math.min(customWidth / naturalWidth, customHeight / naturalHeight);
        targetWidth = Math.round(naturalWidth * scale);
        targetHeight = Math.round(naturalHeight * scale);
      } else {
        targetWidth = customWidth;
        targetHeight = customHeight;
      }
    } else if (customWidth) {
      targetWidth = customWidth;
      targetHeight = Math.round(naturalHeight * (customWidth / naturalWidth));
    } else if (customHeight) {
      targetHeight = customHeight;
      targetWidth = Math.round(naturalWidth * (customHeight / naturalHeight));
    }
  }

  // Determine output format
  const outFormat = options.outputFormat || 'image/jpeg';
  const quality = Math.round((options.quality ?? 0.8) * 100);

  const encodeBuffer = async (q: number): Promise<Buffer> => {
    let p = sharp(inputBuffer);

    // Apply resize if dimensions changed
    if (targetWidth && targetHeight && (targetWidth !== naturalWidth || targetHeight !== naturalHeight)) {
      p = p.resize(targetWidth, targetHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: maintainAspectRatio ? 'inside' : 'fill',
      });
    }

    // Strip EXIF metadata unless explicitly requested
    if (!options.keepMetadata) {
      p = p.rotate(); // auto-rotate according to EXIF, then strip
    } else {
      p = p.withMetadata();
    }

    if (outFormat === 'image/webp') {
      p = p.webp({ quality: q, effort: 5, smartSubsample: true });
    } else if (outFormat === 'image/png') {
      p = p.png({
        quality: q,
        palette: true, // Lossy 8-bit PNG color quantization (pngquant)
        compressionLevel: 9,
      });
    } else if (outFormat === 'image/avif') {
      p = p.avif({ quality: q, effort: 4 });
    } else {
      // Default: MozJPEG
      p = p.jpeg({
        quality: q,
        mozjpeg: true,
        trellisQuantisation: true,
        overshootDeringing: true,
      });
    }

    return await p.toBuffer();
  };

  let finalBuffer = await encodeBuffer(quality);

  // If Target KB constraint is given, perform binary search on quality
  if (targetMaxSizeBytes && targetMaxSizeBytes > 0 && finalBuffer.length > targetMaxSizeBytes) {
    let minQ = 10;
    let maxQ = 95;
    let currentQ = 65;

    for (let i = 0; i < 5; i++) {
      const buf = await encodeBuffer(currentQ);
      if (buf.length <= targetMaxSizeBytes) {
        finalBuffer = buf;
        minQ = currentQ;
        currentQ = Math.round((minQ + maxQ) / 2);
      } else {
        maxQ = currentQ;
        currentQ = Math.round((minQ + maxQ) / 2);
      }
    }
  }

  const finalMeta = await sharp(finalBuffer).metadata();

  return {
    buffer: finalBuffer,
    width: finalMeta.width || targetWidth || naturalWidth,
    height: finalMeta.height || targetHeight || naturalHeight,
    format: outFormat,
    size: finalBuffer.length,
  };
}
