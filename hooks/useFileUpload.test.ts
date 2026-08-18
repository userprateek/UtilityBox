import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from './useFileUpload';

describe('useFileUpload hook integration', () => {
  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['dummy-bytes'], name, { type, lastModified: 1700000000000 });
    Object.defineProperty(file, 'size', { value: size, configurable: true });
    return file;
  };

  it('initializes with empty state and adds valid files', () => {
    const { result } = renderHook(() =>
      useFileUpload({
        rules: {
          acceptMimeTypes: ['image/jpeg', 'image/png'],
          maxFiles: 5,
        },
      })
    );

    expect(result.current.files).toHaveLength(0);
    expect(result.current.errors).toHaveLength(0);

    const file = createMockFile('vacation.jpg', 1024 * 1024, 'image/jpeg');

    act(() => {
      result.current.addFiles([file]);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0]?.name).toBe('vacation.jpg');
    expect(result.current.files[0]?.previewUrl).toBeTruthy();
  });

  it('records validation errors and preserves existing valid files when invalid file is added', () => {
    const { result } = renderHook(() =>
      useFileUpload({
        rules: {
          acceptMimeTypes: ['image/png'],
        },
      })
    );

    const validFile = createMockFile('valid.png', 500, 'image/png');
    const invalidFile = createMockFile('invalid.pdf', 500, 'application/pdf');

    act(() => {
      result.current.addFiles([validFile]);
    });

    expect(result.current.files).toHaveLength(1);

    act(() => {
      result.current.addFiles([invalidFile]);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0]?.code).toBe('INVALID_TYPE');
  });

  it('updates, removes, and clears managed files', () => {
    const { result } = renderHook(() => useFileUpload());

    const file1 = createMockFile('doc1.pdf', 100, 'application/pdf');
    const file2 = createMockFile('doc2.pdf', 200, 'application/pdf');

    act(() => {
      result.current.addFiles([file1, file2]);
    });

    expect(result.current.files).toHaveLength(2);
    const firstId = result.current.files[0]!.id;

    // Update status
    act(() => {
      result.current.updateFile(firstId, { status: 'completed', progress: 100 });
    });

    expect(result.current.files[0]?.status).toBe('completed');
    expect(result.current.files[0]?.progress).toBe(100);

    // Remove file1
    act(() => {
      result.current.removeFile(firstId);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0]?.name).toBe('doc2.pdf');

    // Clear all
    act(() => {
      result.current.clearFiles();
    });

    expect(result.current.files).toHaveLength(0);
  });

  it('reorders files between slots correctly', () => {
    const { result } = renderHook(() => useFileUpload());

    const file1 = createMockFile('page1.pdf', 100, 'application/pdf');
    const file2 = createMockFile('page2.pdf', 200, 'application/pdf');
    const file3 = createMockFile('page3.pdf', 300, 'application/pdf');

    act(() => {
      result.current.addFiles([file1, file2, file3]);
    });

    expect(result.current.files[0]?.name).toBe('page1.pdf');
    expect(result.current.files[1]?.name).toBe('page2.pdf');
    expect(result.current.files[2]?.name).toBe('page3.pdf');

    // Move page3 to slot 0
    act(() => {
      result.current.reorderFiles(2, 0);
    });

    expect(result.current.files[0]?.name).toBe('page3.pdf');
    expect(result.current.files[1]?.name).toBe('page1.pdf');
    expect(result.current.files[2]?.name).toBe('page2.pdf');
  });
});
