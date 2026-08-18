import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from '@/hooks/useFileUpload';

describe('Memory Leak Prevention & Object URL Cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('revokes preview URLs when a file is removed individually', () => {
    const { result } = renderHook(() => useFileUpload());

    const file = new File(['photo-bytes'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    act(() => {
      result.current.addFiles([file]);
    });

    expect(result.current.files).toHaveLength(1);
    const fileId = result.current.files[0]!.id;
    const previewUrl = result.current.files[0]!.previewUrl;

    expect(previewUrl).toBeTruthy();

    act(() => {
      result.current.removeFile(fileId);
    });

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(previewUrl);
    expect(result.current.files).toHaveLength(0);
  });

  it('revokes all object URLs when hook unmounts', () => {
    const { result, unmount } = renderHook(() => useFileUpload());

    const file1 = new File(['bytes1'], 'img1.png', { type: 'image/png' });
    const file2 = new File(['bytes2'], 'img2.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.addFiles([file1, file2]);
    });

    expect(result.current.files).toHaveLength(2);

    const url1 = result.current.files[0]!.previewUrl;
    const url2 = result.current.files[1]!.previewUrl;

    // Unmount component/hook
    unmount();

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(url1);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(url2);
  });
});
