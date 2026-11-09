/** Canonical registered slugs from config/tools/registry.ts at the time this programme was written.
 * Specs compare this list to the live /tools directory so a registry change cannot be silently skipped.
 */
export const REGISTERED_TOOL_SLUGS = [
  'image-compressor',
  'image-resizer',
  'image-cropper',
  'image-converter',
  'document-translator',
  'pdf-merger',
  'pdf-splitter',
  'pdf-to-image',
  'image-to-pdf',
  'json-formatter',
  'qr-code-generator',
  'base64-converter',
  'compress-image-to-50kb',
  'compress-image-to-100kb',
  'passport-photo-maker',
  'passport-sheet-maker',
  'signature-cropper',
  'upi-qr-code-generator',
  'gst-calculator',
  'emi-calculator',
  'gratuity-calculator',
  'discount-calculator',
  'sip-calculator',
  'fd-calculator',
  'word-counter',
  'case-converter',
  'remove-duplicates',
  'uuid',
  'url-encoder',
  'jwt-decoder',
] as const;

export type RegisteredSlug = (typeof REGISTERED_TOOL_SLUGS)[number];
