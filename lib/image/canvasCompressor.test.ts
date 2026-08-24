import { compressImageFile, calculateTargetDimensions } from './canvasCompressor';

describe('canvasCompressor', () => {
  let originalCreateElement: typeof document.createElement;

  beforeAll(() => {
    originalCreateElement = document.createElement.bind(document);
  });

  afterAll(() => {
    document.createElement = originalCreateElement;
  });

  it('calculates target dimensions accurately across all scale modes', () => {
    // 1. Original
    expect(calculateTargetDimensions(4000, 3000, { scaleMode: 'original' })).toEqual({
      width: 4000,
      height: 3000,
    });

    // 2. Percentage
    expect(
      calculateTargetDimensions(4000, 3000, { scaleMode: 'percentage', scalePercentage: 50 })
    ).toEqual({
      width: 2000,
      height: 1500,
    });

    // 3. Preset - Passport
    const passportDims = calculateTargetDimensions(4000, 3000, {
      scaleMode: 'preset',
      dimensionPreset: 'passport',
      maintainAspectRatio: false,
    });
    expect(passportDims).toEqual({ width: 350, height: 450 });

    // 4. Preset - Signature
    const sigDims = calculateTargetDimensions(4000, 1000, {
      scaleMode: 'preset',
      dimensionPreset: 'signature',
      maintainAspectRatio: false,
    });
    expect(sigDims).toEqual({ width: 300, height: 100 });

    // 5. Custom with aspect ratio lock
    expect(
      calculateTargetDimensions(2000, 1000, {
        scaleMode: 'custom',
        customWidth: 1000,
        customHeight: 800,
        maintainAspectRatio: true,
      })
    ).toEqual({
      width: 1000,
      height: 500,
    });
  });

  it('compresses an image file client-side and returns a valid result', async () => {
    // Mock image loader
    const mockImage = {
      naturalWidth: 800,
      naturalHeight: 600,
      onload: null as null | (() => void),
      src: '',
    };

    global.Image = jest.fn().mockImplementation(() => {
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 10);
      return mockImage;
    }) as unknown as typeof Image;

    // Mock HTMLCanvasElement
    const mockCtx = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      fillStyle: '',
      fillRect: jest.fn(),
      drawImage: jest.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn().mockReturnValue(mockCtx),
      toBlob: jest.fn((callback, format) => {
        const dummyBlob = new Blob(['compressed-data'], { type: format || 'image/jpeg' });
        callback(dummyBlob);
      }),
    };

    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return originalCreateElement(tagName);
    });

    const file = new File(['dummy-content'], 'test.jpg', { type: 'image/jpeg' });
    const result = await compressImageFile(file, {
      quality: 0.8,
      outputFormat: 'image/jpeg',
      scaleMode: 'original',
    });

    expect(result).toBeDefined();
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.blob).toBeDefined();
    expect(result.format).toBe('image/jpeg');
  });

  it('compresses using Target Size mode (e.g. 50KB or 100KB)', async () => {
    const file = new File(['dummy-large-content'], 'large-photo.png', { type: 'image/png' });
    const result = await compressImageFile(file, {
      targetMaxSizeBytes: 100 * 1024,
    });

    expect(result).toBeDefined();
    expect(result.blob).toBeDefined();
    expect(result.format).toBe('image/jpeg');
  });

  it('compresses using 20KB target size for signature constraints', async () => {
    const file = new File(['dummy-large-content'], 'signature.png', { type: 'image/png' });
    const result = await compressImageFile(file, {
      targetMaxSizeBytes: 20 * 1024,
    });

    expect(result).toBeDefined();
    expect(result.blob).toBeDefined();
    expect(result.width).toBeLessThanOrEqual(600);
  });
});
