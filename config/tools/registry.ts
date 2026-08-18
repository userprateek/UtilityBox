import { ToolMetadata, ToolCategoryId } from '@/types/tool';

export const TOOL_REGISTRY: Record<string, ToolMetadata> = {
  'image-compressor': {
    slug: 'image-compressor',
    name: 'Image Compressor',
    shortDescription: 'Compress JPEG, PNG, and WebP images client-side without quality loss.',
    description:
      'Reduce file size of your images drastically while retaining crisp visual quality. Everything happens locally in your browser using fast Canvas & WebAssembly compression.',
    category: 'image',
    iconName: 'Minimize2',
    supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20,
    maxFileSizeMB: 50,
    seoTitle: 'Free Online Image Compressor - Compress JPEG, PNG & WebP Securely',
    seoDescription:
      'Compress your images directly in your browser with no quality loss. 100% private, free, and no file uploads to servers.',
    keywords: [
      'image compressor',
      'compress jpg',
      'reduce png size',
      'webp compressor',
      'browser image optimizer',
    ],
    isPopular: true,
    features: [
      'Visual quality slider and preset reduction modes',
      'Instant side-by-side preview with size savings indicator',
      'Batch compression for multiple photos',
      '100% private: files never leave your computer',
    ],
  },
  'image-resizer': {
    slug: 'image-resizer',
    name: 'Image Resizer',
    shortDescription:
      'Resize image dimensions by percentage, exact pixels, or target aspect ratio.',
    description:
      'Quickly resize single or multiple images to exact pixel dimensions, fixed width/height, or scale by percentage with high-quality lanczos/bicubic resampling.',
    category: 'image',
    iconName: 'Maximize2',
    supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20,
    maxFileSizeMB: 50,
    seoTitle: 'Image Resizer - Change Image Dimensions Online Free',
    seoDescription:
      'Resize images by pixels, percentage, or aspect ratio directly in your browser with zero quality degradation.',
    keywords: ['image resizer', 'resize picture', 'change photo resolution', 'batch resize images'],
    isPopular: true,
    features: [
      'Preset aspect ratios (16:9, 4:3, 1:1, Social Media presets)',
      'Maintain aspect ratio lock',
      'Batch resize multiple photos in seconds',
    ],
  },
  'image-cropper': {
    slug: 'image-cropper',
    name: 'Image Cropper',
    shortDescription: 'Crop images with interactive handles and popular preset aspect ratios.',
    description:
      'Crop photos to custom dimensions or standard aspect ratios for Instagram, Twitter, LinkedIn, and profile avatars.',
    category: 'image',
    iconName: 'Crop',
    supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Online Image Cropper - Free & Fast Image Crop Tool',
    seoDescription:
      'Crop your photos online with precision bounding boxes and social aspect ratio presets.',
    keywords: ['image cropper', 'crop picture', 'photo crop online', 'crop avatar'],
    isPopular: false,
    features: [
      'Interactive crop boundary with live preview',
      'Social media aspect ratio presets',
      'Lossless pixel extraction',
    ],
  },
  'image-converter': {
    slug: 'image-converter',
    name: 'Image Converter',
    shortDescription: 'Convert between JPG, PNG, WebP, AVIF, SVG, and GIF formats effortlessly.',
    description:
      'Convert images instantly to modern web formats like WebP or standard formats like PNG and JPG directly inside your browser.',
    category: 'converters',
    iconName: 'RefreshCw',
    supportedInputFormats: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'image/svg+xml',
    ],
    supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 25,
    maxFileSizeMB: 50,
    seoTitle: 'Free Image Converter - Convert JPG, PNG, WebP Online',
    seoDescription:
      'Convert image formats instantly with zero server uploads. Free, Fast, and confidential image conversion.',
    keywords: ['image converter', 'jpg to png', 'png to webp', 'convert photo format'],
    isPopular: true,
    features: [
      'Supports JPG, PNG, WebP, SVG, and GIF inputs',
      'Batch format conversion with single-click zip download',
      'Preserve transparency during conversion',
    ],
  },
  'pdf-compressor': {
    slug: 'pdf-compressor',
    name: 'PDF Compressor',
    shortDescription: 'Reduce PDF file size while maintaining readable text and sharp graphics.',
    description:
      'Compress bloated PDF documents, presentations, and scans to save disk space and meet email attachment limits.',
    category: 'pdf',
    iconName: 'FileMinus',
    supportedInputFormats: ['application/pdf'],
    supportedOutputFormats: ['application/pdf'],
    maxFiles: 5,
    maxFileSizeMB: 100,
    seoTitle: 'PDF Compressor - Reduce PDF File Size Online Free',
    seoDescription:
      'Shrink your PDF documents securely in your browser. No files uploaded to remote servers.',
    keywords: ['pdf compressor', 'compress pdf online', 'reduce pdf size', 'shrink pdf document'],
    isPopular: true,
    features: [
      'Multiple compression presets (Extreme, Recommended, High Quality)',
      'Estimated file size savings before download',
      'Fast client-side vector and raster optimization',
    ],
  },
  'pdf-merger': {
    slug: 'pdf-merger',
    name: 'PDF Merger',
    shortDescription: 'Combine multiple PDF files into a single unified document in seconds.',
    description:
      'Merge individual PDF files together. Drag and drop to reorder pages and documents before generating your final compiled PDF.',
    category: 'pdf',
    iconName: 'Layers',
    supportedInputFormats: ['application/pdf'],
    supportedOutputFormats: ['application/pdf'],
    maxFiles: 30,
    maxFileSizeMB: 100,
    seoTitle: 'Merge PDF Files Online - Free PDF Combiner Tool',
    seoDescription:
      'Combine multiple PDF documents into one cleanly merged file. Drag & drop reordering with 100% private in-browser merging.',
    keywords: ['merge pdf', 'combine pdf files', 'join pdf documents', 'pdf merger online'],
    isPopular: true,
    features: [
      'Visual drag-and-drop page and file reordering',
      'Unlimited file merging with zero server uploads',
      'Retain original bookmarks and form fields',
    ],
  },
  'pdf-splitter': {
    slug: 'pdf-splitter',
    name: 'PDF Splitter',
    shortDescription: 'Extract specific pages or split PDF documents into multiple smaller files.',
    description:
      'Split multipage PDFs into individual page files, or define custom page ranges (e.g. 1-5, 8, 11-14) for fast extraction.',
    category: 'pdf',
    iconName: 'Split',
    supportedInputFormats: ['application/pdf'],
    supportedOutputFormats: ['application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 100,
    seoTitle: 'Split PDF Online - Extract Pages from PDF Document',
    seoDescription:
      'Split PDF pages or extract custom page ranges quickly and privately in your browser.',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf pages', 'pdf cutter online'],
    isPopular: false,
    features: [
      'Visual page selector grid',
      'Custom range syntax support (e.g., 1-3, 7, 9-12)',
      'Download split pages as standalone files or bundled ZIP',
    ],
  },
  'pdf-to-image': {
    slug: 'pdf-to-image',
    name: 'PDF to Image',
    shortDescription: 'Convert PDF pages into high-resolution JPG or PNG images.',
    description:
      'Render pages of your PDF document into crisp, high-DPI image files suitable for presentations, websites, and sharing.',
    category: 'pdf',
    iconName: 'FileImage',
    supportedInputFormats: ['application/pdf'],
    supportedOutputFormats: ['image/jpeg', 'image/png'],
    maxFiles: 5,
    maxFileSizeMB: 50,
    seoTitle: 'PDF to Image Converter - Convert PDF to PNG or JPG Online',
    seoDescription:
      'Convert each page of your PDF into high-quality PNG or JPG images with custom DPI settings.',
    keywords: ['pdf to image', 'pdf to png', 'pdf to jpg', 'convert pdf page to picture'],
    isPopular: true,
    features: [
      'Selectable DPI resolution (72, 150, 300 DPI)',
      'Extract single pages or all pages at once',
      'Transparent background support for PNG',
    ],
  },
  'image-to-pdf': {
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    shortDescription: 'Convert JPG, PNG, and WebP images into a single formatted PDF document.',
    description:
      'Turn photos, receipts, and scans into a clean PDF document with configurable page layout, margins, and orientation.',
    category: 'pdf',
    iconName: 'FileUp',
    supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportedOutputFormats: ['application/pdf'],
    maxFiles: 50,
    maxFileSizeMB: 100,
    seoTitle: 'Image to PDF Converter - Convert Photos to PDF Online',
    seoDescription:
      'Convert JPG, PNG, and WebP photos into a beautiful PDF document with custom margins and page sizes.',
    keywords: ['image to pdf', 'jpg to pdf', 'convert photos to pdf', 'picture to pdf maker'],
    isPopular: true,
    features: [
      'Adjustable page sizes (A4, US Letter, Fit to Image)',
      'Custom margins and page orientations (Portrait / Landscape)',
      'Reorder images before PDF compilation',
    ],
  },
  'json-formatter': {
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    shortDescription: 'Prettify, minify, validate, and inspect JSON data with syntax highlighting.',
    description:
      'Format messy JSON strings into clean indented structures, minify payload size, and check for syntax errors in real time.',
    category: 'developer',
    iconName: 'Braces',
    supportedInputFormats: ['application/json', 'text/plain'],
    supportedOutputFormats: ['application/json', 'text/plain'],
    maxFiles: 1,
    maxFileSizeMB: 10,
    seoTitle: 'JSON Formatter & Validator - Prettify JSON Online',
    seoDescription:
      'Clean, validate, and prettify JSON code with syntax highlighting and instant error detection.',
    keywords: ['json formatter', 'prettify json', 'json validator', 'json beautifier'],
    isPopular: true,
    isNew: true,
    features: [
      'Real-time syntax validation with line-specific errors',
      'Configurable 2-space or 4-space indentation',
      'Instant copy to clipboard and file export',
    ],
  },
  'qr-code-generator': {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    shortDescription:
      'Create instant QR codes for UPI payments, WhatsApp, shop WiFi, links, and text.',
    description:
      'Generate high-resolution printable QR codes for Google Pay / PhonePe / Paytm shop counter payments, WhatsApp customer chats, WiFi passwords, and website links. 100% free with no signup.',
    category: 'utilities',
    iconName: 'QrCode',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['image/png', 'image/svg+xml'],
    maxFiles: 0,
    seoTitle: 'Free QR Code Generator - UPI, WhatsApp, WiFi & Link QR Maker Online',
    seoDescription:
      'Create free printable QR codes for UPI payments, WhatsApp, WiFi credentials, and links. No sign-up required. Instant high-res download.',
    keywords: [
      'qr code generator',
      'upi qr code generator',
      'shop qr code',
      'whatsapp qr maker',
      'wifi qr code',
      'free qr creator',
    ],
    isPopular: true,
    isNew: true,
    features: [
      'Shop UPI Counter QR with custom Payee Name & Amount',
      'WhatsApp direct chat link QR codes',
      'Instant shop WiFi connection QR codes',
      'Print Standee ready high-res PNG downloads',
      '100% Free: No sign-up and no watermarks',
    ],
  },
  'base64-converter': {
    slug: 'base64-converter',
    name: 'Base64 Encoder & Decoder',
    shortDescription: 'Encode and decode text, strings, and files to and from Base64 format.',
    description:
      'Encode text or binary files into Base64 format for web embeds, or decode existing Base64 strings safely.',
    category: 'developer',
    iconName: 'Binary',
    supportedInputFormats: ['*/*'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 1,
    maxFileSizeMB: 10,
    seoTitle: 'Base64 Encoder & Decoder - Convert Files and Text Online',
    seoDescription:
      'Encode and decode strings and files to Base64 in your browser with zero data transmission.',
    keywords: ['base64 encoder', 'base64 decoder', 'file to base64', 'base64 convert'],
    isPopular: false,
    features: [
      'Encode raw text or binary files',
      'Data URL scheme generation for images',
      'Instant copy to clipboard',
    ],
  },
  'compress-image-to-50kb': {
    slug: 'compress-image-to-50kb',
    name: 'Compress Image to 50KB',
    shortDescription:
      'Compress photos and documents under 50KB for Sarkari, UPSC, SSC, and state exam portals.',
    description:
      'Quickly shrink image file sizes strictly under 50KB without losing readability. 100% private in-browser compression with zero server upload.',
    category: 'image',
    iconName: 'Minimize2',
    supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20,
    maxFileSizeMB: 50,
    seoTitle: 'Compress Image to 50KB Online Free - Sarkari & Exam Form Photo Reducer',
    seoDescription:
      'Compress photos and certificates under 50KB for online government job forms, college admissions, and exam portals with zero quality loss.',
    keywords: [
      'compress image to 50kb',
      'reduce photo size to 50kb',
      '50kb photo converter',
      'sarkari form photo 50kb',
      'online photo compressor 50kb',
    ],
    isPopular: true,
    features: [
      'Preset 50KB target reduction',
      'Side-by-side live quality preview',
      '100% Client-side privacy: customer photos stay on device',
      'Instant batch download',
    ],
  },
  'compress-image-to-100kb': {
    slug: 'compress-image-to-100kb',
    name: 'Compress Image to 100KB',
    shortDescription:
      'Reduce photo and scan sizes under 100KB for online registrations and job portals.',
    description:
      'Compress photos, marksheets, and identity scans to under 100KB in seconds directly in your web browser.',
    category: 'image',
    iconName: 'Minimize2',
    supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20,
    maxFileSizeMB: 50,
    seoTitle: 'Compress Image to 100KB Online Free - Fast Photo Size Reducer',
    seoDescription:
      'Shrink your image file size under 100KB directly in your browser. Free, fast, and no server uploads.',
    keywords: [
      'compress image to 100kb',
      'photo compressor 100kb',
      'reduce image size to 100kb',
      '100kb photo converter',
    ],
    isPopular: true,
    features: [
      'Target 100KB optimization preset',
      'Visual clarity indicator',
      'Safe for customer identity documents',
      'No registration required',
    ],
  },
  'passport-photo-maker': {
    slug: 'passport-photo-maker',
    name: 'Passport Size Photo Maker',
    shortDescription: 'Crop and format photos to standard 35×45mm passport dimensions online.',
    description:
      'Easily crop your selfies and portrait photos into official 35×45mm and 2×2 inch passport size specifications with interactive handles.',
    category: 'image',
    iconName: 'Crop',
    supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Passport Size Photo Maker Online Free - 35x45 mm & 2x2 Inch Crop Tool',
    seoDescription:
      'Create passport size photos online for free. Official 35x45mm and 2x2 inch aspect ratio presets with instant high-res download.',
    keywords: [
      'passport photo maker',
      '35x45 mm photo crop',
      'passport size photo maker online',
      'visa photo maker',
      'online passport photo creator',
    ],
    isPopular: true,
    features: [
      'Official 35x45mm (7:9) and 2x2 in (1:1) presets',
      'Precise boundary drag handles',
      'Rotation and flip adjustment tools',
      'High-res printable download',
    ],
  },
  'signature-cropper': {
    slug: 'signature-cropper',
    name: 'Online Signature Cropper',
    shortDescription: 'Crop signatures to standard 3:1 aspect ratio for government and exam forms.',
    description:
      'Extract clean, high-clarity signatures from scanned pages and camera photos. Crop to exact 3:1 and 2:1 form specifications in seconds.',
    category: 'image',
    iconName: 'Crop',
    supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Signature Cropper Online - Crop Signature for Online Forms Free',
    seoDescription:
      'Crop signatures online to exact dimensions (3:1, 2:1) for government job, university, and banking form uploads.',
    keywords: [
      'signature cropper',
      'crop signature online',
      'signature resizer for exam form',
      'signature crop tool',
      'online signature editor',
    ],
    isPopular: true,
    features: [
      '3:1 & 2:1 signature aspect ratio presets',
      'Zoom & rotation correction for crooked scans',
      'Lossless pixel extraction',
      'Instant PNG/JPG download',
    ],
  },
  'upi-qr-code-generator': {
    slug: 'upi-qr-code-generator',
    name: 'Shop UPI QR Code Generator',
    shortDescription:
      'Generate instant shop counter UPI payment QR codes for GPay, PhonePe, and Paytm.',
    description:
      'Create custom printable UPI QR codes with your Shop UPI ID, Payee Name, center logo, and optional fixed amount. Ready for counter standees.',
    category: 'utilities',
    iconName: 'QrCode',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['image/png', 'image/svg+xml'],
    maxFiles: 0,
    seoTitle: 'Shop UPI QR Code Generator - Free Printable Standee QR Maker Online',
    seoDescription:
      'Generate printable UPI payment QR codes for your shop counter. Supports Google Pay, PhonePe, Paytm, and BHIM. 100% free with no watermark.',
    keywords: [
      'upi qr code generator',
      'shop qr code maker',
      'gpay qr code',
      'phonepe qr code generator',
      'print upi standee qr',
    ],
    isPopular: true,
    features: [
      'Shop UPI ID and custom Payee Name configuration',
      'Built-in ₹ Rupee / UPI center logo embedding',
      'Upload custom shop logo with contrast shield',
      '1-Click counter standee print layout',
      'No account & no payment fees',
    ],
  },
};

// ----------------------------------------------------------------------------
// Registry Query Helpers
// ----------------------------------------------------------------------------

export function getAllTools(): ToolMetadata[] {
  return Object.values(TOOL_REGISTRY);
}

export function getToolBySlug(slug: string): ToolMetadata | undefined {
  return TOOL_REGISTRY[slug];
}

export function getToolsByCategory(categoryId: ToolCategoryId): ToolMetadata[] {
  return Object.values(TOOL_REGISTRY).filter((tool) => tool.category === categoryId);
}

export function getPopularTools(): ToolMetadata[] {
  return Object.values(TOOL_REGISTRY).filter((tool) => tool.isPopular);
}

export function getRelatedTools(currentSlug: string, limit: number = 3): ToolMetadata[] {
  const currentTool = TOOL_REGISTRY[currentSlug];
  if (!currentTool) {
    return getPopularTools().slice(0, limit);
  }

  // 1. Same category tools
  const sameCategory = Object.values(TOOL_REGISTRY).filter(
    (t) => t.slug !== currentSlug && t.category === currentTool.category
  );

  // 2. Popular tools from other categories
  const otherPopular = Object.values(TOOL_REGISTRY).filter(
    (t) => t.slug !== currentSlug && t.category !== currentTool.category && t.isPopular
  );

  const combined = [...sameCategory, ...otherPopular];
  return combined.slice(0, limit);
}

export function searchTools(query: string): ToolMetadata[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return getAllTools();

  return Object.values(TOOL_REGISTRY).filter((tool) => {
    return (
      tool.name.toLowerCase().includes(normalized) ||
      tool.shortDescription.toLowerCase().includes(normalized) ||
      tool.keywords.some((k) => k.toLowerCase().includes(normalized)) ||
      tool.category.toLowerCase().includes(normalized)
    );
  });
}
