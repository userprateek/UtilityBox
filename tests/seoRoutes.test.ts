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

    // Verify every registered tool has an entry
    allTools.forEach((tool) => {
      const match = sitemapEntries.find((e) => e.url.endsWith(`/${tool.slug}`));
      expect(match).toBeDefined();
      expect(match?.changeFrequency).toBe('weekly');
    });
  });

  it('generates robots.txt with allow-all rules and sitemap location', () => {
    const robotsConfig = robots();
    expect(robotsConfig.rules).toBeDefined();
    expect(robotsConfig.sitemap).toBe('https://docswala.net/sitemap.xml');
  });

  it('generates rich OpenGraph and Twitter metadata for tool pages', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'image-cropper' }),
    });

    expect(metadata.title).toContain('Image Cropper');
    expect(metadata.description).toBeTruthy();
    expect((metadata.openGraph as Record<string, unknown>)?.['title']).toContain('Image Cropper');
    expect((metadata.openGraph as Record<string, unknown>)?.['type']).toBe('website');
    expect((metadata.twitter as Record<string, unknown>)?.['card']).toBe('summary_large_image');
  });
});
