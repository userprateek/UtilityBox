import { ToolCategoryId, ToolMetadata } from '@/types/tool';
import { siteConfig } from '@/config/site';
import { getToolGuide } from '@/config/tools/guides';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Schema.org SoftwareApplication + WebApplication for a single tool.
 * Offers price 0 because tools are free. No fabricated ratings or review counts.
 */
export function generateToolJsonLd(tool: ToolMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name: tool.name,
    url: `${siteConfig.url}/${tool.slug}`,
    description: tool.description,
    applicationCategory: mapCategoryToSchemaCategory(tool.category),
    operatingSystem: 'Web browser',
    browserRequirements: 'Requires JavaScript. Image and PDF tools also use HTML5 Canvas or WebAssembly.',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
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
    featureList: tool.features,
  };
}

/**
 * HowTo markup taken from the visible English guide on the tool page.
 */
export function generateHowToJsonLd(tool: ToolMetadata) {
  const guide = getToolGuide(tool.slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title.en,
    description: guide.subtitle.en,
    step: guide.steps.map((step) => ({
      '@type': 'HowToStep',
      position: step.stepNumber,
      name: step.title.en,
      text: step.description.en,
      url: `${siteConfig.url}/${tool.slug}#howto-step-${step.stepNumber}`,
    })),
  };
}

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

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.oneLiner,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
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

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.oneLiner,
    logo: `${siteConfig.url}/favicon.svg`,
  };
}

export function generateSiteWebApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.oneLiner,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web browser',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function generateItemListJsonLd(
  tools: ToolMetadata[],
  name: string,
  description: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: `${siteConfig.url}/${tool.slug}`,
      description: tool.shortDescription,
    })),
  };
}

function mapCategoryToSchemaCategory(category: string): string {
  switch (category) {
    case 'image':
      return 'MultimediaApplication';
    case 'pdf':
      return 'BusinessApplication';
    case 'developer':
      return 'DeveloperApplication';
    case 'calculators':
      return 'FinanceApplication';
    default:
      return 'UtilitiesApplication';
  }
}

export function getToolAudience(category: ToolCategoryId): string {
  switch (category) {
    case 'image':
      return 'People filling exam or government forms, students, cyber cafes, and anyone who needs to compress, crop, or resize a photo on a computer or phone.';
    case 'pdf':
      return 'Anyone combining ID scans, marksheets, or other multi-page documents without uploading them to a server.';
    case 'qr':
      return 'Shopkeepers, cafes, and anyone who needs a UPI, WhatsApp, Wi-Fi, or link QR code.';
    case 'text':
      return 'Anyone who needs to count words, change letter case, or clean duplicate lines in a list.';
    case 'converters':
      return 'Anyone converting between common image or document formats in the browser.';
    case 'developer':
      return 'Developers who need JSON formatting, Base64 conversion, URL encoding, UUID generation, or JWT inspection without sending data to a server.';
    case 'calculators':
      return 'Shopkeepers, students, and anyone calculating GST, EMI, SIP, FD, discount, or gratuity figures.';
    default:
      return 'Anyone who needs a free, in-browser document utility with no sign-up.';
  }
}

export function getDefaultToolFaqs(tool: ToolMetadata): FaqItem[] {
  const formats = (tool.supportedInputFormats as string[])
    .map((f) => f.replace('image/', '').replace('application/', '').toUpperCase())
    .join(', ');

  const sizeLimit = tool.maxFileSizeMB
    ? `Each file can be up to ${tool.maxFileSizeMB} MB.`
    : 'There is no advertised per-file size cap for this tool.';
  const fileLimit =
    tool.maxFiles && tool.maxFiles > 0
      ? `You can process up to ${tool.maxFiles} file${tool.maxFiles === 1 ? '' : 's'} at a time.`
      : 'This tool does not take file uploads; you enter values or text in the page.';

  if (
    tool.slug === 'compress-image-to-50kb' ||
    tool.slug === 'compress-image-to-100kb' ||
    tool.slug === 'image-compressor'
  ) {
    return [
      {
        question: `How do I compress a photo under 50KB or 100KB for an online form?`,
        answer: `Open ${tool.name}, add your photo, choose a target size or quality setting, and compress. Processing runs in your browser. ${fileLimit} ${sizeLimit}`,
      },
      {
        question: `Will compressing my photo reduce visual quality?`,
        answer: `Smaller files usually mean some quality loss. Use the quality or target-size controls and check the preview before you download.`,
      },
      {
        question: `Can I compress more than one image at a time?`,
        answer: `Yes. ${fileLimit}`,
      },
      {
        question: `Are photos uploaded to a server?`,
        answer: `No. Compression for this tool runs in your browser. Files are not uploaded to DocsWala for storage.`,
      },
    ];
  }

  if (tool.slug === 'passport-photo-maker') {
    return [
      {
        question: `What passport photo size does this tool produce?`,
        answer: `The built-in Passport 35×45 mm preset uses a 7:9 crop. A 2×2 inch (square) preset is also available for portals that ask for that size.`,
      },
      {
        question: `How do I turn a selfie into a passport-size photo?`,
        answer: `Upload the photo, choose the Passport 35×45 preset, move the crop box so the face and shoulders are centered, then download the cropped image.`,
      },
      {
        question: `Is the passport photo maker free?`,
        answer: `Yes. DocsWala tools are free to use in the browser, with no watermark and no account.`,
      },
      {
        question: `Are photos uploaded to a server?`,
        answer: `No. Cropping runs in your browser. ${sizeLimit}`,
      },
    ];
  }

  if (tool.slug === 'signature-cropper') {
    return [
      {
        question: `What signature size do exam portals usually want?`,
        answer: `Many Indian exam and banking portals ask for a wide 3:1 signature. This tool includes a 3:1 preset so you can crop to that ratio.`,
      },
      {
        question: `How do I crop a signature from a photo of paper?`,
        answer: `Upload the photo, choose the Signature 3:1 preset, tighten the box around the signature, then crop and download.`,
      },
      {
        question: `Can I rotate a tilted signature?`,
        answer: `Yes. Use the rotate and flip controls on the cropper toolbar before you download.`,
      },
      {
        question: `Are signature photos uploaded to a server?`,
        answer: `No. Cropping runs in your browser.`,
      },
    ];
  }

  if (tool.slug === 'upi-qr-code-generator' || tool.slug === 'qr-code-generator') {
    return [
      {
        question: `How do I make a UPI QR for a shop counter?`,
        answer: `Open the UPI QR generator, enter the UPI ID and payee name, then generate and print the standee. The QR uses the standard upi://pay format.`,
      },
      {
        question: `Which apps can scan the UPI QR?`,
        answer: `Any app that understands NPCI UPI QR codes can scan it, including Google Pay, PhonePe, Paytm, and BHIM, as long as the UPI ID is valid.`,
      },
      {
        question: `Does DocsWala take a cut of payments?`,
        answer: `No. DocsWala only generates the QR image in your browser. Payments go to the UPI ID you entered.`,
      },
      {
        question: `Is the QR generator free?`,
        answer: `Yes. There is no sign-up and no watermark on the generated QR.`,
      },
    ];
  }

  if (tool.slug === 'pdf-merger') {
    return [
      {
        question: `How do I merge front and back of an ID into one PDF?`,
        answer: `Add both PDF files (or convert photos to PDF first), put them in front/back order, then merge and download.`,
      },
      {
        question: `Are PDFs uploaded when I merge them?`,
        answer: `No. Merging runs in your browser using client-side PDF libraries. Files are not stored on DocsWala.`,
      },
      {
        question: `Can I change the order of files before merging?`,
        answer: `Yes. You can rearrange uploaded documents before creating the merged PDF.`,
      },
      {
        question: `Is there a file limit?`,
        answer: `${fileLimit} ${sizeLimit} The tool is free and does not add a watermark.`,
      },
    ];
  }

  return [
    {
      question: `Is ${tool.name} free to use?`,
      answer: `Yes. ${tool.name} on DocsWala is free in the browser, with no account and no watermark.`,
    },
    {
      question: `Does ${tool.name} upload my files?`,
      answer: `No. This tool runs in your browser. Files you add are processed on your device and are not stored on DocsWala.`,
    },
    {
      question: `What can I put into ${tool.name}?`,
      answer:
        tool.maxFiles === 0
          ? `${tool.name} uses values or text you type on the page rather than file uploads.`
          : `${tool.name} accepts ${formats || 'the formats listed on the tool page'}. ${fileLimit} ${sizeLimit}`,
    },
    {
      question: `Who is ${tool.name} for?`,
      answer: getToolAudience(tool.category),
    },
  ];
}
