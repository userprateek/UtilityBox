export interface NormalizedCropBox {
  x: number; // 0 to 1 percentage from left of oriented view
  y: number; // 0 to 1 percentage from top of oriented view
  width: number; // 0 to 1 percentage of oriented width
  height: number; // 0 to 1 percentage of oriented height
}

export interface CropImageOptions {
  cropBox: NormalizedCropBox;
  rotation?: number; // 0, 90, 180, 270
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number; // 0.1 to 1.0 (for jpeg and webp)
  outputWidth?: number;
  outputHeight?: number;
  targetMaxSizeBytes?: number;
}

export interface CropResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Loads a File into an HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Performs in-browser crop with optional dimension scaling and target file size constraints.
 */
export async function cropImageFile(file: File, options: CropImageOptions): Promise<CropResult> {
  const img = await loadImageFromFile(file);

  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  const {
    cropBox,
    rotation = 0,
    flipHorizontal = false,
    flipVertical = false,
    format = 'image/jpeg',
    quality = 0.92,
    outputWidth,
    outputHeight,
    targetMaxSizeBytes,
  } = options;

  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isRotated90or270 = normalizedRotation === 90 || normalizedRotation === 270;

  // Oriented dimensions matching what the user sees
  const orientedWidth = isRotated90or270 ? naturalHeight : naturalWidth;
  const orientedHeight = isRotated90or270 ? naturalWidth : naturalHeight;

  // Step 1: Render oriented image onto intermediate canvas
  const orientedCanvas = document.createElement('canvas');
  orientedCanvas.width = orientedWidth;
  orientedCanvas.height = orientedHeight;

  const orientedCtx = orientedCanvas.getContext('2d');
  if (!orientedCtx) {
    throw new Error('Canvas 2D context is not supported in this browser.');
  }

  orientedCtx.imageSmoothingEnabled = true;
  orientedCtx.imageSmoothingQuality = 'high';

  orientedCtx.save();
  orientedCtx.translate(orientedWidth / 2, orientedHeight / 2);

  if (normalizedRotation !== 0) {
    orientedCtx.rotate((normalizedRotation * Math.PI) / 180);
  }

  if (flipHorizontal || flipVertical) {
    orientedCtx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  }

  // Draw natural image centered
  orientedCtx.drawImage(img, -naturalWidth / 2, -naturalHeight / 2, naturalWidth, naturalHeight);
  orientedCtx.restore();

  // Step 2: Slice the exact crop box from the oriented full-res canvas
  const clampedX = Math.max(0, Math.min(1, cropBox.x));
  const clampedY = Math.max(0, Math.min(1, cropBox.y));
  const clampedW = Math.max(0.01, Math.min(1 - clampedX, cropBox.width));
  const clampedH = Math.max(0.01, Math.min(1 - clampedY, cropBox.height));

  const sourceX = Math.round(clampedX * orientedWidth);
  const sourceY = Math.round(clampedY * orientedHeight);
  const cropSourceWidth = Math.max(1, Math.round(clampedW * orientedWidth));
  const cropSourceHeight = Math.max(1, Math.round(clampedH * orientedHeight));

  const finalWidth = outputWidth || cropSourceWidth;
  const finalHeight = outputHeight || cropSourceHeight;

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = finalWidth;
  targetCanvas.height = finalHeight;

  const targetCtx = targetCanvas.getContext('2d');
  if (!targetCtx) {
    throw new Error('Target Canvas 2D context is not supported in this browser.');
  }

  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';

  // White background for JPEG if transparency
  if (format === 'image/jpeg') {
    targetCtx.fillStyle = '#ffffff';
    targetCtx.fillRect(0, 0, finalWidth, finalHeight);
  }

  targetCtx.drawImage(
    orientedCanvas,
    sourceX,
    sourceY,
    cropSourceWidth,
    cropSourceHeight,
    0,
    0,
    finalWidth,
    finalHeight
  );

  // Helper to export canvas to Blob
  const exportBlob = (q: number): Promise<Blob> =>
    new Promise((resolve, reject) => {
      targetCanvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error('Failed to generate cropped image blob.'));
          else resolve(blob);
        },
        format,
        Math.min(1.0, Math.max(0.05, q))
      );
    });

  let chosenBlob = await exportBlob(quality);

  // If targetMaxSizeBytes is provided, do binary search optimization
  if (targetMaxSizeBytes && targetMaxSizeBytes > 0 && chosenBlob.size > targetMaxSizeBytes) {
    let minQ = 0.05;
    let maxQ = 0.95;
    let currentQ = 0.65;

    for (let pass = 0; pass < 5; pass++) {
      const b = await exportBlob(currentQ);
      if (b.size <= targetMaxSizeBytes) {
        chosenBlob = b;
        minQ = currentQ;
        currentQ = (minQ + maxQ) / 2;
      } else {
        maxQ = currentQ;
        currentQ = (minQ + maxQ) / 2;
      }
    }
  }

  const url = URL.createObjectURL(chosenBlob);
  return {
    blob: chosenBlob,
    url,
    width: finalWidth,
    height: finalHeight,
    size: chosenBlob.size,
  };
}
