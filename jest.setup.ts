import '@testing-library/jest-dom';

// Mock window.URL methods
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost:3000/mock-preview-uuid');
  window.URL.revokeObjectURL = jest.fn();

  // Mock HTMLCanvasElement
  HTMLCanvasElement.prototype.getContext = jest.fn((contextId: string) => {
    if (contextId === '2d') {
      return {
        drawImage: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        scale: jest.fn(),
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.toBlob = jest.fn(function (
    callback: BlobCallback,
    type?: string,
    _quality?: any
  ) {
    const mockBlob = new Blob(['mock-binary-data'], { type: type || 'image/png' });
    callback(mockBlob);
  }) as unknown as typeof HTMLCanvasElement.prototype.toBlob;
}
