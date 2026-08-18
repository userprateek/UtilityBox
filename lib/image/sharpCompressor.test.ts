import sharp from 'sharp';
import { processImageWithSharp } from './sharpCompressor';

describe('sharpCompressor (Server-Side)', () => {
  it('compresses a dummy image buffer with MozJPEG and returns sharp result', async () => {
    // Generate a simple 400x300 PNG test buffer using sharp
    const testInputBuffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 4,
        background: { r: 50, g: 120, b: 240, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await processImageWithSharp(testInputBuffer, {
      quality: 0.8,
      outputFormat: 'image/jpeg',
      scaleMode: 'percentage',
      scalePercentage: 50,
    });

    expect(result).toBeDefined();
    expect(result.width).toBe(200);
    expect(result.height).toBe(150);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
    expect(result.format).toBe('image/jpeg');
  });

  it('compresses image buffer using dimension preset (Passport 350x450)', async () => {
    const testInputBuffer = await sharp({
      create: {
        width: 800,
        height: 800,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await processImageWithSharp(testInputBuffer, {
      scaleMode: 'preset',
      dimensionPreset: 'passport',
      maintainAspectRatio: false,
    });

    expect(result.width).toBe(350);
    expect(result.height).toBe(450);
  });
});
