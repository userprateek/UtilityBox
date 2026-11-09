import { detectFileKind, kindToMime } from './fileSignature';

describe('file signatures', () => {
  it('detects PDF, JPEG, PNG, and WebP magic bytes', () => {
    expect(detectFileKind(Buffer.from('%PDF-1.4\n%....'))).toBe('pdf');
    expect(detectFileKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe(
      'jpeg'
    );
    expect(
      detectFileKind(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]))
    ).toBe('png');

    const webp = Buffer.alloc(12);
    webp.write('RIFF', 0);
    webp.write('WEBP', 8);
    expect(detectFileKind(webp)).toBe('webp');
  });

  it('rejects unknown bytes', () => {
    expect(detectFileKind(Buffer.from('not-a-file!!'))).toBe('unknown');
    expect(kindToMime('unknown')).toBeNull();
  });
});
