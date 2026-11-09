import { normalizeImageBox } from './ocr';

describe('normalizeImageBox', () => {
  it('normalizes OCR pixels against the raster image, not the PDF point size', () => {
    const pixelWidth = 1224;
    const pixelHeight = 1584;
    const box = normalizeImageBox(200, 400, 1000, 480, pixelWidth, pixelHeight);

    expect(box.x).toBeCloseTo(200 / pixelWidth);
    expect(box.y).toBeCloseTo(400 / pixelHeight);
    expect(box.width).toBeCloseTo(800 / pixelWidth);
    expect(box.height).toBeCloseTo(80 / pixelHeight);
    expect(box.x).toBeLessThan(200 / (pixelWidth / 2));
    expect(box.y + box.height).toBeLessThanOrEqual(1);
  });
});
