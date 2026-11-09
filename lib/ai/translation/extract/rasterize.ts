import { createCanvas } from '@napi-rs/canvas';
import { openPdfDocument } from '../pdfjs';

export interface RasterPage {
  pageNumber: number;
  /** Page size in PDF points, or source pixels for an image. */
  width: number;
  height: number;
  /** Pixel size of `png`. OCR boxes are in this space, not PDF points. */
  pixelWidth: number;
  pixelHeight: number;
  png: Buffer;
}

export async function rasterizePdfPages(buffer: Buffer, scale = 2): Promise<RasterPage[]> {
  const pdf = await openPdfDocument(buffer);
  const pages: RasterPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext('2d');
    // PDF.js render types target a browser canvas; Node canvas is compatible at runtime.
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;
    pages.push({
      pageNumber,
      width: viewport.width / scale,
      height: viewport.height / scale,
      pixelWidth: canvas.width,
      pixelHeight: canvas.height,
      png: canvas.toBuffer('image/png'),
    });
  }

  return pages;
}

export async function rasterizeImage(buffer: Buffer): Promise<RasterPage> {
  const { default: sharp } = await import('sharp');
  const meta = await sharp(buffer).metadata();
  const png = await sharp(buffer).png().toBuffer();
  const pixelWidth = meta.width ?? 1;
  const pixelHeight = meta.height ?? 1;
  return {
    pageNumber: 1,
    width: pixelWidth,
    height: pixelHeight,
    pixelWidth,
    pixelHeight,
    png,
  };
}
