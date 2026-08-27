import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { generateMetadata } from '@/app/[slug]/page';
import { getAllTools } from '@/config/tools/registry';

describe('SEO & Route Verification', () => {
  it('generates a comprehensive sitemap containing all registered tools', () => {
    const sitemapEntries = sitemap();
    const allTools = getAllTools();

    expect(sitemapEntries.length).toBeGreaterThan(allTools.length);

    // Root and directory
    expect(sitemapEntries.some((e) => e.url === 'https://docswala.net')).toBe(true);
    expect(sitemapEntries.some((e) => e.url === 'https://docswala.net/tools')).toBe(true);
    expect(sitemapEntries.some((e) => e.url === 'https://docswala.net/help')).toBe(true);
    expect(sitemapEntries.some((e) => e.url === 'https://docswala.net/about')).toBe(true);

    // Verify every registered tool has an entry
    allTools.forEach((tool) => {
      const match = sitemapEntries.find((e) => e.url.endsWith(`/${tool.slug}`));
      expect(match).toBeDefined();
      expect(match?.changeFrequency).toBe('weekly');
    });

    const urls = sitemapEntries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((url) => url.includes('/api/'))).toBe(false);
  });

  it('generates robots.txt that allows search and AI crawlers and points to the sitemap', () => {
    const robotsConfig = robots();
    expect(robotsConfig.rules).toBeDefined();
    expect(robotsConfig.sitemap).toBe('https://docswala.net/sitemap.xml');

    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules : [robotsConfig.rules];
    const agents = rules.map((rule) => rule.userAgent);
    expect(agents).toContain('*');
    expect(agents).toContain('Googlebot');
    expect(agents).toContain('OAI-SearchBot');
    expect(agents).toContain('PerplexityBot');
    expect(agents).toContain('GPTBot');
    expect(agents).toContain('ClaudeBot');

    const star = rules.find((rule) => rule.userAgent === '*');
    expect(star?.allow).toBe('/');
    expect(star?.disallow).toEqual(['/api/']);
    const disallows = [star?.disallow].flat();
    expect(disallows.some((path) => String(path).includes('/_next'))).toBe(false);
  });

  it('generates rich OpenGraph and Twitter metadata for tool pages', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'image-cropper' }),
    });

    expect(metadata.title).toContain('Image Cropper');
    expect(metadata.description).toBeTruthy();
    expect(metadata.alternates?.canonical).toBe('https://docswala.net/image-cropper');
    expect((metadata.robots as Record<string, unknown>)?.index).not.toBe(false);
    expect((metadata.openGraph as Record<string, unknown>)?.['title']).toContain('Image Cropper');
    expect((metadata.openGraph as Record<string, unknown>)?.['type']).toBe('website');
    expect((metadata.twitter as Record<string, unknown>)?.['card']).toBe('summary');
  });
});
