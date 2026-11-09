import { resolveExplicitOutputFormat } from './outputFormat';

function file(type: string, name = 'photo.bin'): File {
  return new File(['bytes'], name, { type });
}

describe('resolveExplicitOutputFormat', () => {
  it('keeps PNG, JPEG, and WebP when the output format is original', () => {
    expect(resolveExplicitOutputFormat(file('image/png', 'a.png'), 'original')).toBe('image/png');
    expect(resolveExplicitOutputFormat(file('image/jpeg', 'a.jpg'), 'original')).toBe('image/jpeg');
    expect(resolveExplicitOutputFormat(file('image/jpg', 'a.jpg'), 'original')).toBe('image/jpeg');
    expect(resolveExplicitOutputFormat(file('image/webp', 'a.webp'), 'original')).toBe('image/webp');
  });

  it('uses JPEG for original when the source is not a preserved raster type', () => {
    expect(resolveExplicitOutputFormat(file('image/svg+xml', 'a.svg'), 'original')).toBe(
      'image/jpeg'
    );
  });

  it('returns an explicitly selected format unchanged', () => {
    expect(resolveExplicitOutputFormat(file('image/png'), 'image/jpeg')).toBe('image/jpeg');
    expect(resolveExplicitOutputFormat(file('image/jpeg'), 'image/png')).toBe('image/png');
    expect(resolveExplicitOutputFormat(file('image/jpeg'), 'image/webp')).toBe('image/webp');
  });

  it('leaves an unspecified format to the caller', () => {
    expect(resolveExplicitOutputFormat(file('image/png'), undefined)).toBeUndefined();
  });
});
