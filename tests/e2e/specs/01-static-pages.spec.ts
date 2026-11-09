import { test, expect } from '@playwright/test';
import { attachDiagnostics, ignoreBenignConsole, screenshot } from '../helpers/app';

test.describe('Stage 6 static pages', () => {
  test('homepage loads with tools and no hydration crash', async ({ page }) => {
    const diag = attachDiagnostics(page);
    const res = await page.goto('/', { waitUntil: 'networkidle' });
    expect(res?.ok()).toBeTruthy();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.locator('a[href="/image-compressor"]').first()).toBeVisible();
    await screenshot(page, 'homepage-desktop');
    const errors = ignoreBenignConsole(diag);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('about, help, privacy, terms load', async ({ page }) => {
    for (const route of ['/about', '/help', '/privacy', '/terms']) {
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(res?.ok(), route).toBeTruthy();
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('unknown route shows not-found', async ({ page }) => {
    const res = await page.goto('/this-tool-does-not-exist-xyz', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeGreaterThanOrEqual(400);
  });

  test('sitemap.xml includes tool URLs', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain('image-compressor');
    expect(body).toContain('document-translator');
  });

  test('llms.txt is served', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body.toLowerCase()).toMatch(/docswala|tools/);
  });

  test('legacy /tools/:slug redirects to /:slug', async ({ page }) => {
    const res = await page.goto('/tools/image-compressor', { waitUntil: 'domcontentloaded' });
    expect(res?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/image-compressor$/);
  });
});
