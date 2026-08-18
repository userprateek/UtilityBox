import {
  generateToolJsonLd,
  generateFaqJsonLd,
  generateBreadcrumbJsonLd,
  generateWebsiteJsonLd,
  getDefaultToolFaqs,
} from '@/lib/seo/schema';
import { getAllTools, getToolBySlug } from '@/config/tools/registry';

describe('SEO Structured Data (JSON-LD) Engine', () => {
  const sampleTool = getToolBySlug('image-cropper')!;

  it('generates valid Schema.org WebApplication markup for tools', () => {
    const jsonLd = generateToolJsonLd(sampleTool);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('WebApplication');
    expect(jsonLd.name).toBe('Image Cropper');
    expect(jsonLd.url).toContain('/tools/image-cropper');
    expect(jsonLd.offers['@type']).toBe('Offer');
    expect(jsonLd.offers.price).toBe('0');
    expect(jsonLd.offers.priceCurrency).toBe('USD');
    expect(jsonLd.operatingSystem).toContain('Web Browser');
  });

  it('generates valid Schema.org FAQPage markup for rich snippets', () => {
    const faqs = [
      { question: 'Is it free?', answer: 'Yes, 100% free.' },
      { question: 'Is it private?', answer: 'Yes, runs locally.' },
    ];

    const jsonLd = generateFaqJsonLd(faqs);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toHaveLength(2);
    expect(jsonLd.mainEntity[0]?.['@type']).toBe('Question');
    expect(jsonLd.mainEntity[0]?.name).toBe('Is it free?');
    expect(jsonLd.mainEntity[0]?.acceptedAnswer.text).toBe('Yes, 100% free.');
  });

  it('generates valid Schema.org BreadcrumbList markup with ordered positions', () => {
    const crumbs = [
      { name: 'Home', url: 'https://utilitybox.pp9.uk' },
      { name: 'All Tools', url: 'https://utilitybox.pp9.uk/tools' },
      { name: 'Image Cropper', url: 'https://utilitybox.pp9.uk/tools/image-cropper' },
    ];

    const jsonLd = generateBreadcrumbJsonLd(crumbs);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0]?.position).toBe(1);
    expect(jsonLd.itemListElement[1]?.position).toBe(2);
    expect(jsonLd.itemListElement[2]?.position).toBe(3);
  });

  it('generates valid Schema.org WebSite markup with Sitelinks searchbox action', () => {
    const jsonLd = generateWebsiteJsonLd();

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('WebSite');
    expect(jsonLd.url).toBe('https://utilitybox.pp9.uk');
    expect(jsonLd.potentialAction['@type']).toBe('SearchAction');
    expect(jsonLd.potentialAction.target.urlTemplate).toContain('/tools?q=');
  });

  it('generates high quality FAQs for all registered tools in the registry', () => {
    const allTools = getAllTools();

    allTools.forEach((tool) => {
      const faqs = getDefaultToolFaqs(tool);
      expect(faqs.length).toBeGreaterThanOrEqual(3);
      faqs.forEach((faq) => {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
        expect(faq.question).toContain(tool.name);
      });
    });
  });
});
