import { validateFiles } from './fileValidation';
import { ManagedFile } from '@/types/file';

describe('fileValidation', () => {
  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['mock content'], name, { type, lastModified: 1700000000000 });
    Object.defineProperty(file, 'size', { value: size, configurable: true });
    return file;
  };

  it('accepts valid files within size and MIME constraints', () => {
    const file = createMockFile('photo.jpg', 1024 * 1024, 'image/jpeg');
    const { validFiles, errors } = validateFiles([file], {
      acceptMimeTypes: ['image/jpeg', 'image/png'],
      maxSizeBytes: 10 * 1024 * 1024,
      maxFiles: 5,
    });

    expect(errors).toHaveLength(0);
    expect(validFiles).toHaveLength(1);
    expect(validFiles[0]?.name).toBe('photo.jpg');
  });

  it('rejects files with unsupported MIME types', () => {
    const file = createMockFile('document.pdf', 1024, 'application/pdf');
    const { validFiles, errors } = validateFiles([file], {
      acceptMimeTypes: ['image/jpeg', 'image/png'],
    });

    expect(validFiles).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe('INVALID_TYPE');
  });

  it('supports wildcard MIME types like image/*', () => {
    const jpg = createMockFile('photo.jpg', 1024, 'image/jpeg');
    const png = createMockFile('graphic.png', 1024, 'image/png');
    const pdf = createMockFile('doc.pdf', 1024, 'application/pdf');

    const { validFiles, errors } = validateFiles([jpg, png, pdf], {
      acceptMimeTypes: ['image/*'],
    });

    expect(validFiles).toHaveLength(2);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe('INVALID_TYPE');
  });

  it('rejects files that exceed maximum size', () => {
    const largeFile = createMockFile('large.jpg', 20 * 1024 * 1024, 'image/jpeg');
    const { validFiles, errors } = validateFiles([largeFile], {
      maxSizeBytes: 5 * 1024 * 1024, // 5MB limit
    });

    expect(validFiles).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe('FILE_TOO_LARGE');
  });

  it('detects and rejects duplicate files', () => {
    const file = createMockFile('sample.png', 5000, 'image/png');
    const existing: ManagedFile = {
      id: 'existing-1',
      originalFile: file,
      name: 'sample.png',
      size: 5000,
      type: 'image/png',
      status: 'idle',
      progress: 0,
    };

    const { validFiles, errors } = validateFiles([file], {}, [existing]);

    expect(validFiles).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe('DUPLICATE_FILE');
  });

  it('enforces maximum file count cap', () => {
    const file1 = createMockFile('f1.png', 100, 'image/png');
    const file2 = createMockFile('f2.png', 100, 'image/png');
    const file3 = createMockFile('f3.png', 100, 'image/png');

    const { validFiles, errors } = validateFiles([file1, file2, file3], {
      maxFiles: 2,
    });

    expect(validFiles).toHaveLength(2);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe('MAX_FILES_EXCEEDED');
  });
});
