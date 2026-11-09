import imageCompression from 'browser-image-compression';
import { compressImageAdvanced } from './clientImageCompressor';

jest.mock('browser-image-compression', () => {
  return jest.fn().mockImplementation((_file: File, options?: { fileType?: string }) => {
    return Promise.resolve(
      new Blob(['advanced-compressed-bytes'], { type: options?.fileType || 'image/jpeg' })
    );
  });
});

function mockImage(width: number, height: number) {
  const originalImage = window.Image;
  window.Image = class {
    naturalWidth = width;
    naturalHeight = height;
    src = '';
    onload: (() => void) | null = null;
    constructor() {
      setTimeout(() => this.onload?.(), 10);
    }
  } as unknown as typeof Image;
  return () => {
    window.Image = originalImage;
  };
}

describe('clientImageCompressor', () => {
  it('compresses image using browser-image-compression with dimension calculation', async () => {
    const restore = mockImage(1200, 900);

    const file = new File(['fake-raw-bytes'], 'photo.png', { type: 'image/png' });
    const result = await compressImageAdvanced(file, {
      scaleMode: 'percentage',
      scalePercentage: 50,
      outputFormat: 'image/jpeg',
    });

    expect(result).toBeDefined();
    expect(result.width).toBe(600);
    expect(result.height).toBe(450);
    expect(result.blob).toBeDefined();
    expect(result.format).toBe('image/jpeg');
    expect(result.blob.type).toBe('image/jpeg');

    restore();
  });

  it('preserves PNG, JPEG, and WebP when output format is original', async () => {
    const restore = mockImage(800, 600);
    const cases = [
      ['image/png', 'photo.png'],
      ['image/jpeg', 'photo.jpg'],
      ['image/webp', 'photo.webp'],
    ] as const;

    for (const [type, name] of cases) {
      const result = await compressImageAdvanced(new File(['bytes'], name, { type }), {
        outputFormat: 'original',
        scaleMode: 'custom',
        customWidth: 400,
        customHeight: 300,
        quality: 0.9,
      });
      expect(result.format).toBe(type);
      expect(result.blob.type).toBe(type);
    }

    restore();
  });

  it('still encodes an explicitly selected format', async () => {
    const restore = mockImage(800, 600);
    const png = new File(['bytes'], 'photo.png', { type: 'image/png' });

    const asJpeg = await compressImageAdvanced(png, { outputFormat: 'image/jpeg' });
    const asPng = await compressImageAdvanced(new File(['bytes'], 'photo.jpg', { type: 'image/jpeg' }), {
      outputFormat: 'image/png',
    });
    const asWebp = await compressImageAdvanced(png, { outputFormat: 'image/webp' });

    expect(asJpeg.format).toBe('image/jpeg');
    expect(asPng.format).toBe('image/png');
    expect(asWebp.format).toBe('image/webp');
    expect(imageCompression).toHaveBeenCalled();

    restore();
  });

  it('keeps the compressor default of JPEG when format is omitted for a PNG', async () => {
    const restore = mockImage(800, 600);
    const result = await compressImageAdvanced(new File(['bytes'], 'photo.png', { type: 'image/png' }), {
      quality: 0.8,
    });
    expect(result.format).toBe('image/jpeg');
    restore();
  });
});
