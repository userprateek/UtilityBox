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
      'Choose JPEG, PNG, or WebP output',
      'Preserve transparency during PNG conversion',
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
    category: 'qr',
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
  'passport-sheet-maker': {
    slug: 'passport-sheet-maker',
    name: 'Passport Photo Sheet Generator',
    shortDescription: 'Tile single passport photo into an 8-photo (4x6") or 12-photo (A4) printable grid.',
    description:
      'Instantly generate printable multi-photo sheets on 4x6 inch photo paper or A4 paper with cutting guides. Designed for cyber cafes, xerox shops, and home printers.',
    category: 'image',
    iconName: 'Grid',
    supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportedOutputFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxFiles: 1,
    maxFileSizeMB: 50,
    seoTitle: 'Passport Photo Sheet Generator Online Free - 4x6" & A4 Print Grid Maker',
    seoDescription:
      'Combine 1 passport photo into an 8-photo 4x6" card or 12-photo A4 sheet ready for printing. Free, 100% in-browser, no Photoshop required.',
    keywords: [
      'passport photo sheet generator',
      '4x6 passport photo print maker',
      'passport photo grid maker',
      'multiple passport photo print online',
      'xerox shop passport photo grid',
    ],
    isPopular: true,
    isNew: true,
    features: [
      '8 Photos on 4x6 inch photo paper grid preset',
      '12 & 16 Photos on A4 paper grid preset',
      'Automatic cutting border guidelines',
      'Instant high-res PDF or JPEG printable download',
      '100% Private in-browser generation',
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
    category: 'qr',
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
  'gst-calculator': {
    slug: 'gst-calculator',
    name: 'GST & Shopkeeper Profit Calculator',
    shortDescription:
      'Calculate GST tax, net profit margin, and required MRP / Selling Price for shopkeepers and businesses.',
    description:
      'Simplified GST calculator designed for shopkeepers, traders, and small businesses. Calculate exact MRP needed to make your desired net profit, or add/remove 5%, 12%, 18%, 28% GST tax easily.',
    category: 'calculators',
    iconName: 'Calculator',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'GST Calculator Online - Shopkeeper Profit & Tax MRP Calculator',
    seoDescription:
      'Free GST calculator for shopkeepers & traders. Calculate MRP to keep exact net profit, add or extract 5%, 12%, 18%, 28% GST with CGST & SGST splits.',
    keywords: [
      'gst calculator',
      'shopkeeper profit calculator',
      'gst tax calculator',
      'mrp calculator with gst',
      'gst calculator india',
      'cgst sgst calculator',
    ],
    isPopular: true,
    isNew: true,
    features: [
      'Shopkeeper Profit Mode: Calculate MRP to keep exact desired net profit in pocket',
      'Add GST (Exclusive) & Remove GST (Inclusive) modes',
      'Supports 5%, 12%, 18%, 28%, and custom GST rates',
      'Automatic CGST and SGST 50% split breakdown',
      '100% Free & private in-browser calculation',
    ],
  },
  'emi-calculator': {
    slug: 'emi-calculator',
    name: 'Loan & Shop EMI Calculator',
    shortDescription:
      'Calculate monthly EMI, total interest payable, and repayment schedule for loans.',
    description:
      'Free loan EMI calculator for personal loans, shop business loans, home loans, and vehicle loans. Get instant monthly EMI breakdowns with interest vs principal distribution.',
    category: 'calculators',
    iconName: 'Coins',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'Loan EMI Calculator - Calculate Monthly EMI & Interest Payable Free',
    seoDescription:
      'Calculate monthly loan EMI, total interest payable, and repayment schedules instantly. Ideal for business, personal, and home loans.',
    keywords: [
      'emi calculator',
      'loan emi calculator',
      'business loan emi',
      'monthly emi calculator',
      'interest calculator',
    ],
    isPopular: true,
    isNew: true,
    features: [
      'Calculate monthly EMI, total interest, and total payable amount',
      'Supports tenure in months or years',
      'Visual Principal vs Interest distribution bar',
      'Instant calculation with no signup',
    ],
  },
  'gratuity-calculator': {
    slug: 'gratuity-calculator',
    name: 'Gratuity Settlement Calculator',
    shortDescription:
      'Calculate employee gratuity amount based on basic salary and completed service years.',
    description:
      'Calculate gratuity payout for employees retiring or leaving a company under the Payment of Gratuity Act. Check 5-year minimum eligibility and tax exemption details.',
    category: 'calculators',
    iconName: 'Briefcase',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'Gratuity Calculator Online - Calculate Employee Gratuity Payout',
    seoDescription:
      'Calculate gratuity settlement online based on basic salary + DA and service years. Check 5-year eligibility and tax exemption guidelines.',
    keywords: [
      'gratuity calculator',
      'gratuity calculation formula',
      'employee gratuity calculator',
      'salary gratuity online',
    ],
    isPopular: false,
    isNew: true,
    features: [
      'Official Gratuity Formula: (15 × Basic Salary × Tenure) / 26',
      '5-Year minimum continuous service eligibility checker',
      'Tax exemption threshold information (Up to ₹20 Lakhs)',
      'Instant settlement summary',
    ],
  },
  'discount-calculator': {
    slug: 'discount-calculator',
    name: 'Discount & Shop Margin Calculator',
    shortDescription:
      'Calculate final sale price, total savings, and shopkeeper profit percentage.',
    description:
      'Quickly calculate discounted prices during sales or determine profit margins for products. Enter MRP and discount rate to see your final price and total savings.',
    category: 'calculators',
    iconName: 'Percent',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'Discount Calculator - Calculate Sale Price & Money Saved Online',
    seoDescription:
      'Free discount calculator to find sale prices, total savings, and profit margins. Simple, instant, and mobile-friendly.',
    keywords: [
      'discount calculator',
      'sale price calculator',
      'calculate discount percentage',
      'shop discount calculator',
    ],
    isPopular: false,
    isNew: true,
    features: [
      'Calculate by percentage discount or fixed amount off',
      'Shows Final Price, Money Saved, and Effective Rate',
      'Simple & fast shop counter tool',
    ],
  },
  'sip-calculator': {
    slug: 'sip-calculator',
    name: 'SIP Investment & Compounding Calculator',
    shortDescription:
      'Calculate monthly SIP returns, total wealth gained, and maturity value with compound interest.',
    description:
      'Calculate your Systematic Investment Plan (SIP) and lumpsum investment returns over time. Estimate future wealth growth with monthly compounding, return sliders, and visual growth breakdown.',
    category: 'calculators',
    iconName: 'TrendingUp',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'SIP Calculator Online Free - Calculate Monthly Investment Return & Wealth Growth',
    seoDescription:
      'Calculate monthly SIP investment returns, total interest earned, and maturity wealth. 100% free with interactive return sliders and visual breakdown.',
    keywords: [
      'sip calculator',
      'sip investment return calculator',
      'mutual fund sip calculator',
      'compounding investment calculator',
      'sip wealth calculator',
    ],
    isPopular: true,
    isNew: true,
    features: [
      'Monthly SIP and Lumpsum investment calculation modes',
      'Interactive return rate slider (1% to 30% p.a.)',
      'Visual Principal vs Wealth Growth breakdown bar',
      '1-Click calculation summary copy',
    ],
  },
  'fd-calculator': {
    slug: 'fd-calculator',
    name: 'FD & Bank Deposit Calculator',
    shortDescription:
      'Calculate fixed deposit maturity amount, interest earned, and quarterly compounding returns.',
    description:
      'Calculate bank fixed deposit (FD) interest and maturity value. Supports quarterly compounding (standard bank FD), monthly, and annual interest payouts.',
    category: 'calculators',
    iconName: 'Coins',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'FD Calculator Online Free - Bank Fixed Deposit Interest & Maturity Calculator',
    seoDescription:
      'Calculate fixed deposit maturity returns and interest earned online. Supports quarterly bank compounding and tenure in months or years.',
    keywords: [
      'fd calculator',
      'fixed deposit calculator',
      'bank fd interest calculator',
      'fd maturity calculator',
      'term deposit calculator',
    ],
    isPopular: true,
    isNew: true,
    features: [
      'Quarterly, Monthly, Half-Yearly & Annual compounding frequencies',
      'Calculates Total Interest Earned & Final Maturity Amount',
      'Tenure in Months or Years',
      '100% Free with instant calculation',
    ],
  },
  'word-counter': {
    slug: 'word-counter',
    categoryAlias: 'word-counter',
    name: 'Word & Character Counter',
    shortDescription:
      'Count words, characters, sentences, paragraphs, and reading time in real time.',
    description:
      'Analyze text length, word count, character count with/without spaces, sentence count, and reading time for essays, articles, and application forms.',
    category: 'text',
    iconName: 'FileText',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'Word & Character Counter Online Free - Count Words, Sentences & Reading Time',
    seoDescription:
      'Free online word counter and character counter. Calculate exact word count, character count, and reading time instantly.',
    keywords: ['word counter', 'character counter', 'count words online', 'sentence counter'],
    isPopular: true,
    isNew: true,
    features: [
      'Real-time word, character, sentence, and paragraph counter',
      'Character count with and without spaces',
      'Estimated reading time calculation',
      '100% Client-side text analysis',
    ],
  },
  'case-converter': {
    slug: 'case-converter',
    categoryAlias: 'case-converter',
    name: 'Text Case Converter',
    shortDescription:
      'Convert text case to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, kebab-case.',
    description:
      'Transform text formatting instantly. Convert between uppercase, lowercase, title case, sentence case, camelCase, and kebab-case with 1 click.',
    category: 'text',
    iconName: 'Type',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'Text Case Converter - Convert UPPERCASE, lowercase & Title Case Online',
    seoDescription:
      'Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, and kebab-case instantly in your browser.',
    keywords: ['case converter', 'uppercase converter', 'title case maker', 'camelcase converter'],
    isPopular: true,
    isNew: true,
    features: [
      '1-Click UPPERCASE, lowercase, Title Case, and Sentence case transforms',
      'Code naming conventions: camelCase & kebab-case support',
      'Instant copy to clipboard',
    ],
  },
  'remove-duplicates': {
    slug: 'remove-duplicates',
    categoryAlias: 'remove-duplicates',
    name: 'Remove Duplicate Lines',
    shortDescription: 'Clean text lists by removing duplicate lines and sorting lines alphabetically.',
    description:
      'Deduplicate text lists and files. Strip repeating lines, trim whitespace, and sort lines alphabetically in seconds.',
    category: 'text',
    iconName: 'ListFilter',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'Remove Duplicate Lines Online Free - Clean & Sort Text Lists',
    seoDescription:
      'Remove repeating duplicate lines from text and list files online. Sort lines alphabetically with zero server uploads.',
    keywords: ['remove duplicate lines', 'deduplicate list', 'sort text lines', 'clean text list'],
    isPopular: false,
    isNew: true,
    features: [
      'Instant line-by-line duplicate removal',
      'Alphabetical A-Z line sorting',
      '100% Private in-browser list cleaning',
    ],
  },
  uuid: {
    slug: 'uuid',
    categoryAlias: 'uuid',
    name: 'UUID v4 Generator',
    shortDescription: 'Generate single or bulk random UUID v4 string identifiers online.',
    description:
      'Generate cryptographically secure random UUID v4 identifiers in bulk. Copy formatted UUID strings instantly for databases and APIs.',
    category: 'developer',
    iconName: 'Key',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'UUID v4 Generator Online Free - Bulk Random UUID Generator',
    seoDescription:
      'Generate single or bulk UUID v4 strings instantly in your browser using secure cryptographic randomness.',
    keywords: ['uuid generator', 'uuid v4 maker', 'generate guid online', 'random uuid'],
    isPopular: true,
    isNew: true,
    features: [
      'Bulk generation (1, 5, 10, 20 UUIDs at once)',
      'Cryptographically secure random UUID v4',
      '1-Click copy to clipboard',
    ],
  },
  'url-encoder': {
    slug: 'url-encoder',
    categoryAlias: 'url-encoder',
    name: 'URL Encoder & Decoder',
    shortDescription: 'Encode and decode URI components and query parameter strings.',
    description:
      'Safely percent-encode special characters into URL-encoded strings or decode encoded parameters back to plain text.',
    category: 'developer',
    iconName: 'Link',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['text/plain'],
    maxFiles: 0,
    seoTitle: 'URL Encoder & Decoder Online - Percent Encode Parameter Strings',
    seoDescription:
      'Encode and decode URL string parameters online with 1-click percent encoding.',
    keywords: ['url encoder', 'url decoder', 'percent encoding', 'encode uri component'],
    isPopular: false,
    isNew: true,
    features: [
      '1-Click URL Encoding and Decoding',
      'Handles special characters, spaces, and query strings',
      'Instant copy result',
    ],
  },
  'jwt-decoder': {
    slug: 'jwt-decoder',
    categoryAlias: 'jwt-decoder',
    name: 'JWT Token Decoder',
    shortDescription: 'Decode JSON Web Token (JWT) headers, payload claims, and signatures client-side.',
    description:
      'Decode and inspect JSON Web Tokens (JWT) safely. Parse header algorithms, payload claims, expiration timestamps, and user data 100% locally in browser without sending tokens anywhere.',
    category: 'developer',
    iconName: 'Shield',
    supportedInputFormats: ['text/plain'],
    supportedOutputFormats: ['application/json'],
    maxFiles: 0,
    seoTitle: 'JWT Decoder Online Free - Decode JSON Web Token Claims Securely',
    seoDescription:
      'Decode JWT tokens client-side. Inspect JSON Web Token header and payload claims securely with zero data transmission.',
    keywords: ['jwt decoder', 'decode jwt online', 'inspect jwt token', 'jwt payload parser'],
    isPopular: true,
    isNew: true,
    features: [
      '100% Client-side token decoding (Tokens never sent to any server)',
      'Prettified JSON display for Header and Payload claims',
      'Auto-detects invalid JWT structures',
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
  if (TOOL_REGISTRY[slug]) return TOOL_REGISTRY[slug];

  // Fallback slug mapping for category short paths (e.g. 'compress' -> 'image-compressor', 'merge' -> 'pdf-merger', 'upi' -> 'upi-qr-code-generator')
  const slugAliases: Record<string, string> = {
    resize: 'image-resizer',
    compress: 'image-compressor',
    crop: 'image-cropper',
    convert: 'image-converter',
    merge: 'pdf-merger',
    split: 'pdf-splitter',
    'jpg-to-pdf': 'image-to-pdf',
    'pdf-to-jpg': 'pdf-to-image',
    upi: 'upi-qr-code-generator',
    gst: 'gst-calculator',
    emi: 'emi-calculator',
    sip: 'sip-calculator',
    discount: 'discount-calculator',
    gratuity: 'gratuity-calculator',
    base64: 'base64-converter',
    'base64-encoder': 'base64-converter',
    'base64-decoder': 'base64-converter',
    'base64-encode': 'base64-converter',
    'base64-decode': 'base64-converter',
  };

  const mappedSlug = slugAliases[slug];
  if (mappedSlug && TOOL_REGISTRY[mappedSlug]) {
    return TOOL_REGISTRY[mappedSlug];
  }

  return undefined;
}

export function getToolByCategoryAndSlug(
  category: string,
  slug: string
): ToolMetadata | undefined {
  const tool = getToolBySlug(slug);
  if (tool) return tool;

  // Search by category and matching slug or categoryAlias
  return Object.values(TOOL_REGISTRY).find((t) => {
    return (
      (t.category === category || t.category === category.toLowerCase()) &&
      (t.slug === slug || t.categoryAlias === slug)
    );
  });
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

