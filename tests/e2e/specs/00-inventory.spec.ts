import { test, expect } from '@playwright/test';
import { REGISTERED_TOOL_SLUGS } from '../helpers/registry';
import { attachDiagnostics, screenshot } from '../helpers/app';

test.describe('Stage 0/4 registry inventory', () => {
  test('live /tools directory lists every registered tool and no extras', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /all docswala tools/i })).toBeVisible();

    const expectedSlugs = [...REGISTERED_TOOL_SLUGS];
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((anchors, slugs: string[]) => {
      const wanted = new Set(slugs.map((slug) => `/${slug}`));
      return Array.from(
        new Set(
          anchors
            .map((a) => (a as HTMLAnchorElement).getAttribute('href') || '')
            .filter((href) => wanted.has(href))
        )
      );
    }, expectedSlugs);

    const liveSlugs = hrefs.map((h) => h.replace(/^\//, '')).sort();
    const expected = [...REGISTERED_TOOL_SLUGS].sort();

    await screenshot(page, 'tools-directory');

    expect(liveSlugs, `Missing from /tools: ${expected.filter((s) => !liveSlugs.includes(s)).join(', ')}`).toEqual(
      expected
    );
    expect(REGISTERED_TOOL_SLUGS).toHaveLength(30);
    expect(diag.failedRequests.filter((u) => u.includes('localhost') && !u.includes('gtag'))).toEqual([]);
  });

  for (const slug of REGISTERED_TOOL_SLUGS) {
    test(`route /${slug} returns 200 and shows a heading`, async ({ page }) => {
      const response = await page.goto(`/${slug}`, { waitUntil: 'domcontentloaded' });
      expect(response?.ok(), `/${slug} HTTP ${response?.status()}`).toBeTruthy();
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page).not.toHaveTitle(/not found/i);
    });
  }
});
