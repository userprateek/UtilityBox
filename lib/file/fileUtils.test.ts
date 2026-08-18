import { formatBytes, calculateSavings, getFileExtension, changeFileExtension } from './fileUtils';

describe('fileUtils', () => {
  describe('formatBytes', () => {
    it('formats 0 bytes properly', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('formats bytes, kilobytes, megabytes, and gigabytes', () => {
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(10485760)).toBe('10 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('calculateSavings', () => {
    it('calculates savings percentage accurately', () => {
      const original = 1000;
      const processed = 300;
      const savings = calculateSavings(original, processed);

      expect(savings.isReduced).toBe(true);
      expect(savings.savedBytes).toBe(700);
      expect(savings.percentage).toBe(70);
    });

    it('handles cases where processed file is larger', () => {
      const original = 500;
      const processed = 600;
      const savings = calculateSavings(original, processed);

      expect(savings.isReduced).toBe(false);
      expect(savings.savedBytes).toBe(0);
      expect(savings.percentage).toBe(0);
    });
  });

  describe('getFileExtension', () => {
    it('extracts extensions correctly', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('photo.JPEG')).toBe('jpeg');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
      expect(getFileExtension('noextension')).toBe('');
    });
  });

  describe('changeFileExtension', () => {
    it('replaces extension seamlessly', () => {
      expect(changeFileExtension('photo.jpg', 'webp')).toBe('photo.webp');
      expect(changeFileExtension('photo.jpg', '.png')).toBe('photo.png');
      expect(changeFileExtension('document', 'pdf')).toBe('document.pdf');
    });
  });
});
