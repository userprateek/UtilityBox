import { test, expect } from '@playwright/test';
import { attachDiagnostics, ignoreBenignConsole } from '../helpers/app';

const tools = [
  ['Image Compressor', '/image-compressor'],
  ['Image Resizer', '/image-resizer'],
  ['PDF Merger', '/pdf-merger'],
  ['PDF Splitter', '/pdf-splitter'],
  ['Image to PDF', '/image-to-pdf'],
  ['QR Code Generator', '/qr-code-generator'],
] as const;

test.describe('Homepage quick launch and language prompt', () => {
  test('six cards and View All Tools open the real routes', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await page.addInitScript(() => {
      localStorage.setItem('docswala-language', 'en');
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('dialog')).toHaveCount(0);

    for (const [name, href] of tools) {
      const card = page.getByRole('link', { name: new RegExp(name) }).first();
      await expect(card).toHaveAttribute('href', href);
    }

    await page.getByRole('link', { name: 'View All Tools' }).click();
    await expect(page).toHaveURL(/\/tools$/);
    await expect(page.getByRole('searchbox', { name: 'Search tools' })).toBeVisible();

    await page.goto('/image-compressor', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
    expect(ignoreBenignConsole(diag), ignoreBenignConsole(diag).join('\n')).toEqual([]);
  });

  test('direct tool URLs load', async ({ page }) => {
    for (const [, href] of tools) {
      const res = await page.goto(href, { waitUntil: 'domcontentloaded' });
      expect(res?.ok(), href).toBeTruthy();
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('desktop is three columns and mobile is two', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('docswala-language', 'en');
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const desktop = await page.locator('a[href="/image-compressor"], a[href="/image-resizer"], a[href="/pdf-merger"]').evaluateAll((nodes) =>
      nodes.slice(0, 3).map((node) => Math.round(node.getBoundingClientRect().top))
    );
    const [desktopFirst, desktopSecond, desktopThird] = desktop;
    if (desktopFirst === undefined || desktopSecond === undefined || desktopThird === undefined) {
      throw new Error('Expected three quick-launch cards on desktop');
    }
    expect(desktopFirst).toBe(desktopSecond);
    expect(desktopSecond).toBe(desktopThird);

    await page.setViewportSize({ width: 375, height: 812 });
    const mobile = await page.locator('a[href="/image-compressor"], a[href="/pdf-merger"]').evaluateAll((nodes) =>
      nodes.slice(0, 2).map((node) => Math.round(node.getBoundingClientRect().top))
    );
    const [mobileFirst, mobileSecond] = mobile;
    if (mobileFirst === undefined || mobileSecond === undefined) {
      throw new Error('Expected two quick-launch rows on mobile');
    }
    expect(mobileSecond).toBeGreaterThan(mobileFirst);
  });

  test('first visit asks for a language, then hindi stays after reload', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    const dialog = page.getByRole('dialog', { name: /choose your language/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'English' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'हिंदी' })).toBeVisible();

    await dialog.getByRole('button', { name: 'हिंदी' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-lang', 'hi');
    await expect(page.locator('h1 [data-i18n="hi"]')).toBeVisible();
    await expect(page.locator('h1 [data-i18n="en"]')).toBeHidden();
    await expect(page.locator('footer [data-i18n="hi"]').first()).toBeVisible();
    await expect(page.locator('footer [data-i18n="en"]').first()).toBeHidden();
    const compressor = page.locator('a[href="/image-compressor"]').first();
    await expect(compressor.locator('[data-i18n="hi"]').first()).toBeVisible();
    await expect(compressor.locator('[data-i18n="en"]').first()).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('docswala-language'))).toBe('hi');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-lang', 'hi');
    await expect(compressor.locator('[data-i18n="hi"]').first()).toBeVisible();

    await page.goto('/pdf-merger', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-lang', 'hi');
    await expect(page.getByText('कई PDF को एक फ़ाइल में जोड़ें।').first()).toBeVisible();

    await page.goto('/image-compressor', { waitUntil: 'domcontentloaded' });
    await page.getByRole('group', { name: 'Website language' }).getByRole('button', { name: 'English' }).click();
    expect(await page.evaluate(() => localStorage.getItem('docswala-language'))).toBe('en');
    await expect(page.locator('html')).toHaveAttribute('data-lang', 'en');

    await page.getByRole('button', { name: 'Switch to Hindi guide' }).click();
    expect(await page.evaluate(() => localStorage.getItem('docswala-language'))).toBe('hi');
    await page.getByRole('button', { name: 'Switch to English guide' }).click();
    expect(await page.evaluate(() => localStorage.getItem('docswala-language'))).toBe('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('a[href="/image-compressor"]').first().locator('[data-i18n="en"]').first()).toBeVisible();
    expect(ignoreBenignConsole(diag), ignoreBenignConsole(diag).join('\n')).toEqual([]);
  });
});
