import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Public pages are open to legitimate search and AI crawlers.
 * /api/ is disallowed because it is an application endpoint, not a content page.
 * /_next/static/ must stay allowed — Googlebot needs those CSS/JS files to render
 * the page. Blocking /_next/ produces an unstyled screenshot in Search Console.
 *
 * Named user-agents below are listed so operators can see they are not blocked.
 * Listing a crawler here is not a claim of official partnership or guaranteed indexing.
 */
export default function robots(): MetadataRoute.Robots {
  const publicAllow = {
    allow: '/',
    disallow: ['/api/'],
  };

  return {
    rules: [
      {
        userAgent: '*',
        ...publicAllow,
      },
      { userAgent: 'Googlebot', ...publicAllow },
      { userAgent: 'Google-Extended', ...publicAllow },
      { userAgent: 'Bingbot', ...publicAllow },
      { userAgent: 'Applebot', ...publicAllow },
      { userAgent: 'GPTBot', ...publicAllow },
      { userAgent: 'ChatGPT-User', ...publicAllow },
      { userAgent: 'OAI-SearchBot', ...publicAllow },
      { userAgent: 'PerplexityBot', ...publicAllow },
      { userAgent: 'ClaudeBot', ...publicAllow },
      { userAgent: 'anthropic-ai', ...publicAllow },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
