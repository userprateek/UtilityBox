import { PDFDocument, PDFImage } from 'pdf-lib';
import { readFileAsArrayBuffer } from './pdfMerger';

export type PageSizeOption = 'a4' | 'letter' | 'fit';
export type PageOrientationOption = 'portrait' | 'landscape' | 'auto';
export type ImagesPerPageOption = 1 | 2 | 4;
export type MarginOption = 'none' | 'small' | 'standard' | 'large';

export interface ImageToPdfOptions {
  pageSize?: PageSizeOption;
  orientation?: PageOrientationOption;
  imagesPerPage?: ImagesPerPageOption;
  margin?: MarginOption;
}

export interface ImageToPdfResult {
  blob: Blob;
  size: number;
  pageCount: number;
  filename: string;
}

// Standard paper dimensions in points (72 points / inch)
const PAGE_DIMENSIONS: Record<'a4' | 'letter', { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.0, height: 792.0 },
};

const MARGIN_POINTS: Record<MarginOption, number> = {
  none: 0,
  small: 15,
  standard: 25,
  large: 45,
};

/**
 * Safely converts any image (JPG, PNG, WebP, AVIF, etc.) to a format embeddable by pdf-lib (JPEG/PNG).
 */
async function getEmbeddableImage(
  pdfDoc: PDFDocument,
  file: File
): Promise<{ image: PDFImage; width: number; height: number }> {
  // If PNG
  if (file.type === 'image/png') {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const image = await pdfDoc.embedPng(buffer);
      const dims = image.scale(1);
      return { image, width: dims.width, height: dims.height };
    } catch {
      // fallback to canvas converter if corrupted or non-standard PNG
    }
  }

  // If standard JPEG
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const image = await pdfDoc.embedJpg(buffer);
      const dims = image.scale(1);
      return { image, width: dims.width, height: dims.height };
    } catch {
      // fallback to canvas converter
    }
  }

  // For WebP, AVIF, SVG, or other formats: convert via HTML5 Image & Canvas
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Browser environment required to process this image format.'));
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const jpegBlob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, 'image/jpeg', 0.95)
        );

        if (!jpegBlob) {
          return reject(new Error('Failed to convert image to JPEG format for PDF.'));
        }

        const buffer = await readFileAsArrayBuffer(jpegBlob);
        const image = await pdfDoc.embedJpg(buffer);
        const dims = image.scale(1);
        resolve({ image, width: dims.width, height: dims.height });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Converts multiple images to a PDF document with exact page layout controls.
 */
export async function convertImagesToPdf(
  files: File[],
  options: ImageToPdfOptions = {},
  onProgress?: (current: number, total: number, message: string) => void
): Promise<ImageToPdfResult> {
  if (!files || files.length === 0) {
    throw new Error('No images provided to convert.');
  }

  const pdfDoc = await PDFDocument.create();
  const pageSize = options.pageSize || 'a4';
  const imagesPerPage = options.imagesPerPage || 1;
  const marginPt = MARGIN_POINTS[options.margin || 'standard'];

  // Process and embed all images
  const loadedImages: Array<{ image: PDFImage; width: number; height: number }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    onProgress?.(i + 1, files.length * 2, `Preparing image ${i + 1} of ${files.length}...`);
    const loaded = await getEmbeddableImage(pdfDoc, file);
    loadedImages.push(loaded);
  }

  let totalPagesCreated = 0;

  if (pageSize === 'fit' && imagesPerPage === 1) {
    // Exact 1:1 image page dimensions (no blank space, fits image exactly)
    for (let i = 0; i < loadedImages.length; i++) {
      const { image, width, height } = loadedImages[i]!;
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      });
      totalPagesCreated++;
    }
  } else {
    // Standard Document Layouts (A4 / Letter)
    const baseDim = PAGE_DIMENSIONS[pageSize === 'letter' ? 'letter' : 'a4'];

    for (let i = 0; i < loadedImages.length; i += imagesPerPage) {
      const chunk = loadedImages.slice(i, i + imagesPerPage);
      totalPagesCreated++;

      onProgress?.(
        files.length + Math.min(i + imagesPerPage, files.length),
        files.length * 2,
        `Arranging page ${totalPagesCreated}...`
      );

      // Determine page orientation
      let isLandscape = options.orientation === 'landscape';
      if (options.orientation === 'auto') {
        const firstImg = chunk[0]!;
        isLandscape = firstImg.width > firstImg.height;
      }

      const pWidth = isLandscape ? baseDim.height : baseDim.width;
      const pHeight = isLandscape ? baseDim.width : baseDim.height;
      const page = pdfDoc.addPage([pWidth, pHeight]);

      const usableWidth = pWidth - marginPt * 2;
      const usableHeight = pHeight - marginPt * 2;

      if (chunk.length === 1) {
        // 1 Image on the Page (Centered & Scaled to fit without cutting)
        const imgItem = chunk[0]!;
        const scale = Math.min(usableWidth / imgItem.width, usableHeight / imgItem.height, 1);
        const drawW = imgItem.width * scale;
        const drawH = imgItem.height * scale;
        const drawX = marginPt + (usableWidth - drawW) / 2;
        const drawY = marginPt + (usableHeight - drawH) / 2;

        page.drawImage(imgItem.image, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      } else if (chunk.length === 2) {
        // 2 Images on 1 Page: Stacked vertically or side-by-side without cutting
        const isVerticalSplit = pHeight >= pWidth;
        const slotW = isVerticalSplit ? usableWidth : usableWidth / 2;
        const slotH = isVerticalSplit ? usableHeight / 2 : usableHeight;

        for (let sIdx = 0; sIdx < chunk.length; sIdx++) {
          const imgItem = chunk[sIdx]!;
          const scale = Math.min(slotW / imgItem.width, slotH / imgItem.height, 1);
          const drawW = imgItem.width * scale;
          const drawH = imgItem.height * scale;

          let slotOriginX = marginPt;
          let slotOriginY = marginPt;

          if (isVerticalSplit) {
            // Slot 0 top, Slot 1 bottom
            slotOriginY = marginPt + (1 - sIdx) * slotH;
          } else {
            // Slot 0 left, Slot 1 right
            slotOriginX = marginPt + sIdx * slotW;
          }

          const drawX = slotOriginX + (slotW - drawW) / 2;
          const drawY = slotOriginY + (slotH - drawH) / 2;

          page.drawImage(imgItem.image, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH,
          });
        }
      } else {
        // 4 Images on 1 Page (2x2 Grid)
        const slotW = usableWidth / 2;
        const slotH = usableHeight / 2;

        for (let sIdx = 0; sIdx < chunk.length; sIdx++) {
          const imgItem = chunk[sIdx]!;
          const scale = Math.min(slotW / imgItem.width, slotH / imgItem.height, 1);
          const drawW = imgItem.width * scale;
          const drawH = imgItem.height * scale;

          const col = sIdx % 2;
          const row = Math.floor(sIdx / 2); // 0 is top row, 1 is bottom row

          const slotOriginX = marginPt + col * slotW;
          const slotOriginY = marginPt + (1 - row) * slotH;

          const drawX = slotOriginX + (slotW - drawW) / 2;
          const drawY = slotOriginY + (slotH - drawH) / 2;

          page.drawImage(imgItem.image, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH,
          });
        }
      }
    }
  }

  onProgress?.(files.length * 2, files.length * 2, 'Generating PDF document...');

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

  const baseName = files[0]?.name.replace(/\.[^.]+$/, '') || 'images';
  const filename = `${baseName}_converted.pdf`;

  return {
    blob: pdfBlob,
    size: pdfBlob.size,
    pageCount: totalPagesCreated,
    filename,
  };
}
