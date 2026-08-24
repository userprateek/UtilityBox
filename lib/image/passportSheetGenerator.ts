export type SheetPaperSize = '4x6' | 'a4_12' | 'a4_16';

export interface SheetOptions {
  paperSize: SheetPaperSize;
  showCutLines: boolean;
  borderColor: string;
}

export async function generatePassportPhotoSheet(
  imageFile: File,
  options: SheetOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // 300 DPI Constants
        let canvasWidth = 1800; // 6 inches @ 300 DPI
        let canvasHeight = 1200; // 4 inches @ 300 DPI
        let photoWidth = 413; // ~35mm @ 300 DPI
        let photoHeight = 531; // ~45mm @ 300 DPI
        let cols = 4;
        let rows = 2;

        if (options.paperSize === 'a4_12') {
          canvasWidth = 2480; // A4 width 210mm @ 300 DPI
          canvasHeight = 3508; // A4 height 297mm @ 300 DPI
          cols = 3;
          rows = 4;
          photoWidth = 550;
          photoHeight = 707;
        } else if (options.paperSize === 'a4_16') {
          canvasWidth = 2480;
          canvasHeight = 3508;
          cols = 4;
          rows = 4;
          photoWidth = 480;
          photoHeight = 617;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Fill crisp white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Calculate spacing
        const totalPhotosW = cols * photoWidth;
        const totalPhotosH = rows * photoHeight;
        const gapX = Math.floor((canvasWidth - totalPhotosW) / (cols + 1));
        const gapY = Math.floor((canvasHeight - totalPhotosH) / (rows + 1));

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = gapX + c * (photoWidth + gapX);
            const y = gapY + r * (photoHeight + gapY);

            // Draw photo
            ctx.drawImage(img, x, y, photoWidth, photoHeight);

            // Optional cut lines / border
            if (options.showCutLines) {
              ctx.strokeStyle = options.borderColor || '#cccccc';
              ctx.lineWidth = 2;
              ctx.setLineDash([8, 6]);
              ctx.strokeRect(x, y, photoWidth, photoHeight);
            }
          }
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate sheet image blob'));
            }
          },
          'image/jpeg',
          0.95
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load input photo'));
    };

    img.src = url;
  });
}
