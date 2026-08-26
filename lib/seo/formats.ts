const MIME_LABELS: Record<string, string> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
  'image/gif': 'GIF',
  'image/svg+xml': 'SVG',
  'application/pdf': 'PDF',
  'application/json': 'JSON',
  'text/plain': 'Plain text',
  'text/csv': 'CSV',
  '*/*': 'Any file',
};

export function formatMimeLabel(mime: string): string {
  if (MIME_LABELS[mime]) return MIME_LABELS[mime];
  const subtype = mime.includes('/') ? mime.split('/')[1] : mime;
  return (subtype || mime).replace(/xml$/, 'XML').toUpperCase();
}

export function formatMimeList(mimes: string[] | undefined): string {
  if (!mimes || mimes.length === 0) return '';
  return mimes.map(formatMimeLabel).join(', ');
}
