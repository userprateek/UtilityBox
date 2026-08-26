import { siteConfig } from '@/config/site';

/**
 * Formats a byte number into human-readable units (B, KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Calculates percentage savings between original and processed sizes
 */
export function calculateSavings(
  originalBytes: number,
  processedBytes: number
): {
  percentage: number;
  savedBytes: number;
  isReduced: boolean;
} {
  const diff = originalBytes - processedBytes;
  const percentage = originalBytes > 0 ? Math.round((diff / originalBytes) * 100) : 0;
  return {
    percentage: Math.max(0, percentage),
    savedBytes: Math.max(0, diff),
    isReduced: diff > 0,
  };
}

/**
 * Extracts clean domain host from site URL (e.g. 'docswala.net')
 */
export function getSiteDomain(): string {
  try {
    return siteConfig.url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || 'docswala.net';
  } catch {
    return 'docswala.net';
  }
}

/**
 * Generates a branded filename for downloaded files.
 * Format: {uploadedfilename}_{action}_{siteurl}.{extension}
 *
 * Example:
 *  - passport_photo.jpg + compressed -> passport_photo_compressed_docswala.net.jpg
 *  - signature.png + cropped -> signature_cropped_docswala.net.png
 *  - marksheets.pdf + merged -> marksheets_merged_docswala.net.pdf
 *  - qrcode_upi + qr -> qrcode_upi_qr_docswala.net.png
 */
export function generateDownloadFilename(
  originalFilename: string,
  action: string = 'processed',
  customExtension?: string
): string {
  const domain = getSiteDomain();

  // Extract base filename without extension
  const lastDot = originalFilename.lastIndexOf('.');
  const rawBaseName = lastDot > 0 ? originalFilename.slice(0, lastDot) : originalFilename;

  // Clean special characters from base name while preserving readability
  const cleanBaseName =
    rawBaseName
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '') || 'file';

  // Format action string (e.g. image-compressor -> compressed, pdf-merger -> merged)
  const actionMap: Record<string, string> = {
    'image-compressor': 'compressed',
    'pdf-compressor': 'compressed',
    'image-cropper': 'cropped',
    'image-resizer': 'resized',
    'image-converter': 'converted',
    'pdf-merger': 'merged',
    'pdf-splitter': 'split',
    'pdf-to-image': 'converted',
    'image-to-pdf': 'converted',
    'qr-code-generator': 'qr',
    'json-formatter': 'formatted',
    'base64-converter': 'converted',
  };

  const cleanAction = (
    actionMap[action] ||
    action
      .replace(/^image-|^pdf-/, '')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .toLowerCase() ||
    'processed'
  ).toLowerCase();

  // Determine output extension
  const extension = (
    customExtension
      ? customExtension.replace(/^\./, '')
      : getFileExtension(originalFilename) || 'bin'
  ).toLowerCase();

  return `${cleanBaseName}_${cleanAction}_${domain}.${extension}`;
}

/**
 * Triggers a browser download from a Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Triggers a browser download from a URL or Data URL
 */
export function downloadUrl(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Reads a File as an ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Reads a File as a Data URL (base64 string)
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a File as Plain Text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
}

/**
 * Extracts the file extension (e.g. 'jpg', 'png', 'pdf')
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Replaces or appends an extension to a filename
 */
export function changeFileExtension(filename: string, newExt: string): string {
  const cleanExt = newExt.startsWith('.') ? newExt.slice(1) : newExt;
  const lastDot = filename.lastIndexOf('.');
  const baseName = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  return `${baseName}.${cleanExt}`;
}

/**
 * Maps a MIME type to a download-safe file extension.
 */
export function mimeTypeToExtension(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/json': 'json',
    'text/plain': 'txt',
  };
  return map[mime] || '';
}
