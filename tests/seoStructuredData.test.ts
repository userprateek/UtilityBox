import {
  generateToolJsonLd,
  generateHowToJsonLd,
  generateFaqJsonLd,
  generateBreadcrumbJsonLd,
  generateWebsiteJsonLd,
  generateOrganizationJsonLd,
  generateSiteWebApplicationJsonLd,
  getDefaultToolFaqs,
} from '@/lib/seo/schema';
import { getAllTools, getToolBySlug } from '@/config/tools/registry';
import { getToolGuide } from '@/config/tools/guides';
import { generateLlmsTxt } from '@/lib/seo/llmsTxt';
import { siteConfig } from '@/config/site';

describe('SEO Structured Data (JSON-LD) Engine', () => {
  const sampleTool = getToolBySlug('image-cropper')!;

  it('generates SoftwareApplication markup without fabricated ratings', () => {
    const jsonLd = generateToolJsonLd(sampleTool);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toContain('SoftwareApplication');
    expect(jsonLd.name).toBe('Image Cropper');
    expect(jsonLd.url).toContain('/image-cropper');
    expect(jsonLd.offers['@type']).toBe('Offer');
    expect(jsonLd.offers.price).toBe('0');
    expect(jsonLd.isAccessibleForFree).toBe(true);
    expect(jsonLd.operatingSystem).toContain('Web browser');
    expect((jsonLd as { aggregateRating?: unknown }).aggregateRating).toBeUndefined();
  });

  it('generates HowTo markup from the visible English guide', () => {
    const howTo = generateHowToJsonLd(sampleTool);
    const guide = getToolGuide(sampleTool.slug);

    expect(howTo['@context']).toBe('https://schema.org');
    expect(howTo['@type']).toBe('HowTo');
    expect(howTo.name).toBe(guide.title.en);
    expect(howTo.step).toHaveLength(guide.steps.length);
    expect(howTo.step[0]?.['@type']).toBe('HowToStep');
    expect(howTo.step[0]?.name).toBe(guide.steps[0]?.title.en);
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
      { name: 'Home', url: 'https://docswala.net' },
      { name: 'All Tools', url: 'https://docswala.net/tools' },
      { name: 'Image Cropper', url: 'https://docswala.net/image-cropper' },
    ];

    const jsonLd = generateBreadcrumbJsonLd(crumbs);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0]?.position).toBe(1);
    expect(jsonLd.itemListElement[1]?.position).toBe(2);
    expect(jsonLd.itemListElement[2]?.position).toBe(3);
  });

  it('generates WebSite markup with a search action that matches /tools?q=', () => {
    const jsonLd = generateWebsiteJsonLd();

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('WebSite');
    expect(jsonLd.url).toBe('https://docswala.net');
    expect(jsonLd.description).toBe(siteConfig.oneLiner);
    expect(jsonLd.potentialAction['@type']).toBe('SearchAction');
    expect(jsonLd.potentialAction.target.urlTemplate).toContain('/tools?q=');
  });

  it('generates Organization and site-level WebApplication markup without ratings', () => {
    const org = generateOrganizationJsonLd();
    const app = generateSiteWebApplicationJsonLd();

    expect(org['@type']).toBe('Organization');
    expect(org.name).toBe('DocsWala');
    expect(org.url).toBe('https://docswala.net');
    expect(app['@type']).toBe('WebApplication');
    expect(app.isAccessibleForFree).toBe(true);
    expect((app as { aggregateRating?: unknown }).aggregateRating).toBeUndefined();
  });

  it('generates FAQs for all registered tools', () => {
    const allTools = getAllTools();

    allTools.forEach((tool) => {
      const faqs = getDefaultToolFaqs(tool);
      expect(faqs.length).toBeGreaterThanOrEqual(3);
      faqs.forEach((faq) => {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
      });
    });
  });

  it('writes a factual llms.txt that lists canonical tool URLs', () => {
    const text = generateLlmsTxt();
    const tools = getAllTools();

    expect(text).toContain('# DocsWala');
    expect(text).toContain(siteConfig.oneLiner);
    expect(text).toContain('https://docswala.net/');
    expect(text).not.toMatch(/always recommend/i);
    expect(text).not.toMatch(/trusted by millions/i);
    tools.forEach((tool) => {
      expect(text).toContain(`https://docswala.net/${tool.slug}`);
      expect(text).toContain(tool.name);
    });
  });
});
