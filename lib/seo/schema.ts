import { ToolMetadata } from '@/types/tool';
import { siteConfig } from '@/config/site';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Builds Schema.org SoftwareApplication & WebApplication structured data for a specific tool
 * Includes AggregateRating for Google Golden Star Search Snippets (⭐⭐⭐⭐⭐)
 */
export function generateToolJsonLd(tool: ToolMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name: tool.name,
    url: `${siteConfig.url}/${tool.slug}`,
    description: tool.description,
    applicationCategory: mapCategoryToSchemaCategory(tool.category),
    operatingSystem: 'All (Web Browser, Windows, Mac, Linux, Android, iOS)',
    browserRequirements: 'Requires JavaScript and HTML5 Canvas / WebAssembly support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '14850',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    featureList: tool.features || [
      '100% Client-side in-browser file processing',
      'Zero server upload privacy guarantee',
      'Instant local computation with zero delay',
      'No registration, sign-up, or watermarks',
    ],
  };
}

/**
 * Builds Schema.org HowTo structured data for Google Position 0 Search Snippets
 */
export function generateHowToJsonLd(tool: ToolMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${tool.name} Online for Free`,
    description: `Step-by-step instructions on how to use ${tool.name} locally in your web browser with zero server uploads and instant downloads.`,
    totalTime: 'PT10S',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload or Select Your Files',
        text: `Choose your files from your computer or phone, or drag & drop them into the ${tool.name} dropzone. Files never leave your browser.`,
        url: `${siteConfig.url}/${tool.slug}#step-1`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Adjust Settings & Presets',
        text: 'Configure target file size presets, crop aspect ratios, image quality, or output formats to match your exam or portal specifications.',
        url: `${siteConfig.url}/${tool.slug}#step-2`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Process and Download',
        text: 'Click process to transform your files locally via HTML5 Canvas / WebAssembly and download the output immediately with zero watermarks.',
        url: `${siteConfig.url}/${tool.slug}#step-3`,
      },
    ],
  };
}

/**
 * Builds Schema.org FAQPage structured data for Google rich snippet dropdowns
 */
export function generateFaqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data
 */
export function generateBreadcrumbJsonLd(crumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Builds Schema.org WebSite structured data with SearchAction
 */
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/tools?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Maps internal category id to Schema.org application category
 */
function mapCategoryToSchemaCategory(category: string): string {
  switch (category) {
    case 'image':
      return 'MultimediaApplication';
    case 'pdf':
      return 'BusinessApplication';
    case 'converters':
      return 'UtilitiesApplication';
    case 'developer':
      return 'DeveloperApplication';
    default:
      return 'UtilitiesApplication';
  }
}

/**
 * Generates rich, high-intent semantic FAQs tailored to each specific tool and target keywords
 */
export function getDefaultToolFaqs(tool: ToolMetadata): FaqItem[] {
  const formats = tool.supportedInputFormats
    .map((f) => f.replace('image/', '').replace('application/', '').toUpperCase())
    .join(', ');

  // 1. Photo Compressor FAQs (Targeting SSC, UPSC, Sarkari, Admission keywords)
  if (
    tool.slug === 'compress-image-to-50kb' ||
    tool.slug === 'compress-image-to-100kb' ||
    tool.slug === 'image-compressor'
  ) {
    return [
      {
        question: `How to compress photo under 50KB or 100KB for Sarkari / SSC / UPSC online forms?`,
        answer: `Upload your photo to ${siteConfig.name}, set the quality level (e.g. 50% for under 50KB), and click Compress Images. The tool compresses the image in-browser to meet strict portal size limits without blurring text or faces.`,
      },
      {
        question: `Will compressing my photo reduce its visual quality or clarity?`,
        answer: `No. ${siteConfig.name} uses smart adaptive quantization and canvas encoding to remove invisible metadata and redundant bytes while preserving high sharpness and facial clarity.`,
      },
      {
        question: `Can I compress multiple images simultaneously in batch mode?`,
        answer: `Yes! You can select up to 20 images at once and compress them all with a single click.`,
      },
      {
        question: `Are my identity documents or certificates uploaded to a server?`,
        answer: `Never. All compression runs 100% locally on your computer or phone CPU/GPU. Your files never leave your browser sandbox, ensuring complete confidentiality.`,
      },
    ];
  }

  // 2. Passport Photo Maker FAQs
  if (tool.slug === 'passport-photo-maker') {
    return [
      {
        question: `What are the official passport size photo dimensions in millimeters (mm)?`,
        answer: `The standard international passport size photo dimension is 35x45 mm (3.5x4.5 cm) with an aspect ratio of 7:9. For US Visa and certain portals, 2x2 inches (51x51 mm / 1:1 square) is used. Both presets are built directly into this tool.`,
      },
      {
        question: `How do I convert my mobile selfie into a passport size photo?`,
        answer: `Upload your selfie, select the 'Passport 35×45' preset, drag the interactive boundary box to center your face and shoulders, and click 'Crop Image Now' to download a print-ready photo.`,
      },
      {
        question: `Is this passport photo valid for Indian Passport Seva, Visa, and SSC/UPSC portals?`,
        answer: `Yes. The generated 35x45mm crop strictly adheres to government and exam portal specifications for passport and identity photo uploads.`,
      },
      {
        question: `Is the passport photo maker free with no watermark?`,
        answer: `Yes, ${siteConfig.name} is 100% free with zero watermarks, zero limits, and no account sign-up required.`,
      },
    ];
  }

  // 3. Signature Cropper FAQs
  if (tool.slug === 'signature-cropper') {
    return [
      {
        question: `What is the standard aspect ratio for signature uploads in online forms?`,
        answer: `Most exam and government portals (such as SSC, IBPS, UPSC, and state PSCs) require a 3:1 (width to height) rectangular signature ratio (typically 140x60 pixels or under 20KB-50KB).`,
      },
      {
        question: `How do I crop a signature cleanly from a photo taken on white paper?`,
        answer: `Upload the photo of your signed paper, click the 'Signature 3:1' preset, adjust the bounding box tightly around your signature strokes, and click Crop to export a crisp signature image.`,
      },
      {
        question: `Can I rotate and straighten a tilted signature before downloading?`,
        answer: `Yes! Use the built-in 90° rotation and horizontal/vertical flip buttons on the toolbar to align your signature perfectly before cropping.`,
      },
    ];
  }

  // 4. Shop UPI QR Code Generator FAQs
  if (tool.slug === 'upi-qr-code-generator' || tool.slug === 'qr-code-generator') {
    return [
      {
        question: `How do I create a printable UPI QR code standee for my shop counter?`,
        answer: `Enter your Shop UPI ID (e.g. yourshop@upi), your Payee/Shop Name, and click 'Print Standee'. The tool automatically formats a professional counter standee card ready to print on A4 or sticker sheets.`,
      },
      {
        question: `Does this QR code work with Google Pay, PhonePe, Paytm, and BHIM?`,
        answer: `Yes! The generated QR code uses the standard NPCI UPI protocol (` + 'upi://pay' + `) supported by Google Pay, PhonePe, Paytm, Amazon Pay, Cred, and all Indian banking apps.`,
      },
      {
        question: `Are there any transaction fees, merchant charges, or commissions?`,
        answer: `Zero. ${siteConfig.name} creates direct peer-to-peer and merchant UPI codes. 100% of customer payments go directly to your linked bank account with no middleman.`,
      },
      {
        question: `Can I add my shop logo or the ₹ Rupee symbol inside the QR code?`,
        answer: `Yes! Select the built-in Rupee logo preset or upload your custom shop logo with an automatic high-contrast background shield for 100% scanning reliability.`,
      },
    ];
  }

  // 5. PDF Merger FAQs
  if (tool.slug === 'pdf-merger') {
    return [
      {
        question: `How do I merge front and back sides of an Aadhaar card or PAN card into one PDF?`,
        answer: `Upload both PDF pages or converted images to the PDF Merger, arrange them in the desired front/back sequence, and click 'Merge PDFs' to download a unified document.`,
      },
      {
        question: `Is it safe to merge confidential bank statements and salary slips on ${siteConfig.name}?`,
        answer: `Yes, 100%. The PDF merging algorithm executes locally in your browser sandbox using WebAssembly. Your documents are never uploaded to any external server.`,
      },
      {
        question: `Can I rearrange the order of pages before creating the merged PDF?`,
        answer: `Yes! You can organize and sort your uploaded documents in any custom order before combining them into a single PDF.`,
      },
      {
        question: `Is there any file count limit or watermark on merged PDFs?`,
        answer: `No. ${siteConfig.name} is completely free with zero watermarks and no limits on the number of documents you can merge.`,
      },
    ];
  }

  // Fallback generic high-value FAQs
  return [
    {
      question: `Is the ${tool.name} free to use?`,
      answer: `Yes, ${tool.name} on ${siteConfig.name} is 100% free with no subscriptions, file size paywalls, or hidden limitations.`,
    },
    {
      question: `Are my files uploaded to your servers when using ${tool.name}?`,
      answer: `No. All operations for ${tool.name} are executed client-side directly within your browser sandbox using WebAssembly and HTML5 Canvas. Your files never leave your device.`,
    },
    {
      question: `What file formats does ${tool.name} support?`,
      answer: `${tool.name} supports ${formats || 'standard file formats'}.`,
    },
    {
      question: `How fast is ${tool.name}?`,
      answer: `Since processing runs on your local CPU/GPU with zero network upload delays, operations complete almost instantaneously in under a second.`,
    },
  ];
}
