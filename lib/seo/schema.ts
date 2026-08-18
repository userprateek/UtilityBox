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
 * Builds Schema.org WebApplication structured data for a specific tool
 */
export function generateToolJsonLd(tool: ToolMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: `${siteConfig.url}/tools/${tool.slug}`,
    description: tool.description,
    applicationCategory: mapCategoryToSchemaCategory(tool.category),
    operatingSystem: 'All (Web Browser)',
    browserRequirements: 'Requires JavaScript and HTML5 Canvas / WebAssembly support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: tool.features || [
      '100% Client-side in-browser file processing',
      'Zero server upload privacy guarantee',
      'Instant local computation',
    ],
  };
}

/**
 * Builds Schema.org FAQPage structured data for Google rich snippets
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
 * Generates default high-value FAQs for a given tool
 */
export function getDefaultToolFaqs(tool: ToolMetadata): FaqItem[] {
  const formats = tool.supportedInputFormats
    .map((f) => f.replace('image/', '').replace('application/', '').toUpperCase())
    .join(', ');

  return [
    {
      question: `Is the ${tool.name} free to use?`,
      answer: `Yes, ${tool.name} on UtilityBox is 100% free with no subscriptions, file size paywalls, or hidden limitations.`,
    },
    {
      question: `Are my files uploaded to your servers when using ${tool.name}?`,
      answer: `No. All operations for ${tool.name} are executed client-side directly within your browser sandbox using WebAssembly and Web APIs. Your files never leave your device.`,
    },
    {
      question: `What file formats does ${tool.name} support?`,
      answer: `${tool.name} supports ${formats}.`,
    },
    {
      question: `How fast is ${tool.name}?`,
      answer: `Since processing runs on your local CPU/GPU with zero network upload delays, operations complete almost instantaneously.`,
    },
  ];
}
