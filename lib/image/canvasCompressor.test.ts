import { compressImageFile } from './canvasCompressor';

describe('canvasCompressor', () => {
  let originalCreateElement: typeof document.createElement;

  beforeAll(() => {
    originalCreateElement = document.createElement.bind(document);
  });

  afterAll(() => {
    document.createElement = originalCreateElement;
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
    });

    expect(result).toBeDefined();
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.blob).toBeDefined();
    expect(result.format).toBe('image/jpeg');
  });
});
