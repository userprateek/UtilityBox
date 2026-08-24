import { compressImageAdvanced } from './clientImageCompressor';

// Mock browser-image-compression
jest.mock('browser-image-compression', () => {
  return jest.fn().mockImplementation((_file: File) => {
    return Promise.resolve(new Blob(['advanced-compressed-bytes'], { type: 'image/jpeg' }));
  });
});

describe('clientImageCompressor', () => {
  it('compresses image using browser-image-compression with dimension calculation', async () => {
    // Mock image loader in JSDOM
    const originalImage = window.Image;
    window.Image = class {
      naturalWidth = 1200;
      naturalHeight = 900;
      src = '';
      onload: (() => void) | null = null;
      constructor() {
        setTimeout(() => this.onload?.(), 10);
      }
    } as unknown as typeof Image;

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

    window.Image = originalImage;
  });
});
