import { cropImageFile } from './canvasCropper';

describe('canvasCropper', () => {
  const createMockImageFile = (): File => {
    return new File(['fake-image-bytes'], 'photo.png', { type: 'image/png' });
  };

  it('performs canvas crop with normalized coordinates and returns valid blob and dimensions', async () => {
    const file = createMockImageFile();

    // Mock HTMLImageElement image loading in JSDOM
    const originalImage = window.Image;
    window.Image = class {
      naturalWidth = 1000;
      naturalHeight = 800;
      src = '';
      onload: (() => void) | null = null;
      constructor() {
        setTimeout(() => this.onload?.(), 10);
      }
    } as unknown as typeof Image;

    const result = await cropImageFile(file, {
      cropBox: { x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
      rotation: 0,
      format: 'image/png',
    });

    expect(result.width).toBe(500); // 0.5 * 1000
    expect(result.height).toBe(400); // 0.5 * 800
    expect(result.blob).toBeDefined();
    expect(result.url).toBeTruthy();

    window.Image = originalImage;
  });

  it('swaps width and height on 90 degree rotation', async () => {
    const file = createMockImageFile();

    const originalImage = window.Image;
    window.Image = class {
      naturalWidth = 1000;
      naturalHeight = 800;
      src = '';
      onload: (() => void) | null = null;
      constructor() {
        setTimeout(() => this.onload?.(), 10);
      }
    } as unknown as typeof Image;

    const result = await cropImageFile(file, {
      cropBox: { x: 0, y: 0, width: 1, height: 1 },
      rotation: 90,
      format: 'image/webp',
    });

    expect(result.width).toBe(800); // Swapped due to 90 deg rotation
    expect(result.height).toBe(1000);

    window.Image = originalImage;
  });
});
