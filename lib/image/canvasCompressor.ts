import { ImageCompressionOptions, ImageProcessorResult, DimensionPreset } from './types';
import { loadImageFromFile } from './canvasCropper';

export const DIMENSION_PRESETS: Record<
  DimensionPreset,
  { width: number; height: number; name: string; desc: string }
> = {
  passport: {
    width: 350,
    height: 450,
    name: 'Passport Size (35×45mm)',
    desc: 'Standard Photo for Visa/Forms',
  },
  passport_sq: {
    width: 600,
    height: 600,
    name: 'Passport Square (2×2 inch)',
    desc: 'US Visa & OCI Card',
  },
  signature: {
    width: 300,
    height: 100,
    name: 'Signature Standard (3:1)',
    desc: 'SSC, UPSC, Govt Exams',
  },
  signature_large: {
    width: 560,
    height: 160,
    name: 'Signature Large (3.5:1)',
    desc: 'Banking & High-Res Forms',
  },
  postcard: {
    width: 1200,
    height: 800,
    name: 'Postcard Photo (4×6 inch)',
    desc: 'NEET / Admit Card Postcard',
  },
  hd: { width: 1280, height: 720, name: 'HD Resolution (720p)', desc: 'Web & Mobile optimized' },
  fhd: { width: 1920, height: 1080, name: 'Full HD (1080p)', desc: 'Desktop & Document Display' },
};

/**
 * Calculates output dimensions based on scale mode and constraints
 */
export function calculateTargetDimensions(
  naturalWidth: number,
  naturalHeight: number,
  options: ImageCompressionOptions
): { width: number; height: number } {
  const {
    scaleMode = 'original',
    scalePercentage = 100,
    customWidth,
    customHeight,
    maintainAspectRatio = true,
    dimensionPreset,
  } = options;

  let width = naturalWidth;
  let height = naturalHeight;

  if (scaleMode === 'percentage') {
    const pct = Math.max(1, Math.min(100, scalePercentage)) / 100;
    width = Math.round(naturalWidth * pct);
    height = Math.round(naturalHeight * pct);
  } else if (scaleMode === 'preset' && dimensionPreset && DIMENSION_PRESETS[dimensionPreset]) {
    const preset = DIMENSION_PRESETS[dimensionPreset];
    if (maintainAspectRatio) {
      const scale = Math.min(preset.width / naturalWidth, preset.height / naturalHeight);
      width = Math.round(naturalWidth * scale);
      height = Math.round(naturalHeight * scale);
    } else {
      width = preset.width;
      height = preset.height;
    }
  } else if (scaleMode === 'custom') {
    if (customWidth && customHeight) {
      if (maintainAspectRatio) {
        const scale = Math.min(customWidth / naturalWidth, customHeight / naturalHeight);
        width = Math.round(naturalWidth * scale);
        height = Math.round(naturalHeight * scale);
      } else {
        width = customWidth;
        height = customHeight;
      }
    } else if (customWidth) {
      width = customWidth;
      height = Math.round(naturalHeight * (customWidth / naturalWidth));
    } else if (customHeight) {
      height = customHeight;
      width = Math.round(naturalWidth * (customHeight / naturalHeight));
    }
  } else if (options.maxWidth || options.maxHeight) {
    if (options.maxWidth && width > options.maxWidth) {
      const ratio = options.maxWidth / width;
      width = options.maxWidth;
      height = Math.round(height * ratio);
    }
    if (options.maxHeight && height > options.maxHeight) {
      const ratio = options.maxHeight / height;
      height = options.maxHeight;
      width = Math.round(width * ratio);
    }
  }

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

/**
 * Renders an image to a canvas with given dimensions and exports to a Blob.
 */
function renderCanvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  format: string,
  quality: number
): Promise<{ blob: Blob; size: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not supported in this browser.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill crisp white background for JPEG exports if transparency exists
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob.'));
          return;
        }
        resolve({ blob, size: blob.size });
      },
      format,
      Math.min(1.0, Math.max(0.05, quality))
    );
  });
}

/**
 * Advanced in-browser image compression engine.
 * Guaranteed Target KB constraint: Adapts resolution and quality iteratively
 * so output is strictly <= target KB (e.g. 20KB, 50KB, 100KB).
 */
export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<ImageProcessorResult> {
  const img = await loadImageFromFile(file);
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  // Determine export format
  let format = 'image/jpeg';
  if (options.outputFormat === 'image/webp') {
    format = 'image/webp';
  } else if (options.outputFormat === 'image/png') {
    format = 'image/png';
  } else if (options.outputFormat === 'image/jpeg') {
    format = 'image/jpeg';
  } else {
    // Auto: photos -> JPEG for real reduction, webp -> webp
    if (file.type === 'image/webp') {
      format = 'image/webp';
    } else if (file.type === 'image/png' && !options.targetMaxSizeBytes && options.quality === 1) {
      format = 'image/png';
    } else {
      format = 'image/jpeg';
    }
  }

  // PNG quality is ignored by canvas; target-KB mode must use a lossy format
  if (options.targetMaxSizeBytes && options.targetMaxSizeBytes > 0 && format === 'image/png') {
    format = 'image/jpeg';
  }

  // Calculate target dimensions from scale mode & presets
  const dims = calculateTargetDimensions(naturalWidth, naturalHeight, options);
  const targetWidth = dims.width;
  const targetHeight = dims.height;

  const { targetMaxSizeBytes } = options;

  // --------------------------------------------------------------------------
  // MODE 1: Strict Target File Size (KB) Mode
  // --------------------------------------------------------------------------
  if (targetMaxSizeBytes && targetMaxSizeBytes > 0) {
    // Optimal dimension ceiling for strict KB targets
    let maxDimCeiling = 2048;
    if (targetMaxSizeBytes <= 25 * 1024) {
      maxDimCeiling = 600; // 20KB Signatures / Thumbnails
    } else if (targetMaxSizeBytes <= 55 * 1024) {
      maxDimCeiling = 1000; // 50KB Passport / Sarkari Photos
    } else if (targetMaxSizeBytes <= 105 * 1024) {
      maxDimCeiling = 1400; // 100KB Govt Forms
    } else if (targetMaxSizeBytes <= 205 * 1024) {
      maxDimCeiling = 1800;
    }

    const scale = Math.min(1, maxDimCeiling / Math.max(naturalWidth, naturalHeight));
    let curWidth = Math.min(targetWidth, Math.round(naturalWidth * scale));
    let curHeight = Math.min(targetHeight, Math.round(naturalHeight * scale));

    let bestResult: {
      blob: Blob;
      size: number;
      width: number;
      height: number;
      quality: number;
    } | null = null;

    let minQ = 0.05;
    let maxQ = 0.95;
    let currentQ = 0.7;

    // Iterative binary search for the highest visual clarity that stays strictly <= targetMaxSizeBytes
    for (let pass = 0; pass < 8; pass++) {
      const res = await renderCanvasToBlob(img, curWidth, curHeight, format, currentQ);

      if (res.size <= targetMaxSizeBytes) {
        bestResult = { ...res, width: curWidth, height: curHeight, quality: currentQ };
        minQ = currentQ;
        currentQ = (minQ + maxQ) / 2;
      } else {
        maxQ = currentQ;
        currentQ = (minQ + maxQ) / 2;
      }

      // If quality is at floor and size still exceeds target, downscale dimensions
      if (maxQ - minQ < 0.04 && (!bestResult || bestResult.size > targetMaxSizeBytes)) {
        if (curWidth > 80 && curHeight > 40) {
          curWidth = Math.round(curWidth * 0.8);
          curHeight = Math.round(curHeight * 0.8);
          minQ = 0.1;
          maxQ = 0.85;
          currentQ = 0.6;
        }
      }
    }

    // Guaranteed fallback: keep shrinking until size is strictly <= target
    while ((!bestResult || bestResult.size > targetMaxSizeBytes) && curWidth > 16 && curHeight > 16) {
      curWidth = Math.max(16, Math.round(curWidth * 0.8));
      curHeight = Math.max(16, Math.round(curHeight * 0.8));
      const res = await renderCanvasToBlob(img, curWidth, curHeight, format, 0.4);
      if (!bestResult || res.size < bestResult.size || res.size <= targetMaxSizeBytes) {
        bestResult = { ...res, width: curWidth, height: curHeight, quality: 0.4 };
      }
      if (res.size <= targetMaxSizeBytes) {
        break;
      }
    }

    if (bestResult && bestResult.size <= targetMaxSizeBytes) {
      return {
        blob: bestResult.blob,
        width: bestResult.width,
        height: bestResult.height,
        size: bestResult.size,
        format,
      };
    }

    const targetKb = Math.round((targetMaxSizeBytes || 0) / 1024);
    throw new Error(
      `Could not compress this image under ${targetKb}KB. Try JPEG output or a smaller source photo.`
    );
  }

  // --------------------------------------------------------------------------
  // MODE 2: Explicit Quality Mode (with calculated dimensions)
  // --------------------------------------------------------------------------
  const quality = options.quality ?? 0.8;
  const rendered = await renderCanvasToBlob(img, targetWidth, targetHeight, format, quality);

  return {
    blob: rendered.blob,
    width: targetWidth,
    height: targetHeight,
    size: rendered.size,
    format,
  };
}
