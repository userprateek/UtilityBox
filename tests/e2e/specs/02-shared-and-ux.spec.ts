import { test, expect } from '@playwright/test';
import { fixture } from '../helpers/paths';
import { attachDiagnostics, openTool, screenshot, uploadFiles } from '../helpers/app';

test.describe('Stage 3 shared FileDropzone / ToolShell', () => {
  test('dropzone accepts a PNG, shows file, reset clears it', async ({ page }) => {
    attachDiagnostics(page);
    await openTool(page, 'image-compressor');
    await expect(page.getByLabel(/upload files/i)).toBeVisible();
    await uploadFiles(page, fixture.png);
    await expect(page.getByText(/red-800x600\.png/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /compress images/i })).toBeEnabled();
    await screenshot(page, 'shared-dropzone-file-listed');
    await page.getByRole('button', { name: /^reset$/i }).click();
    await expect(page.getByLabel(/upload files/i)).toBeVisible();
  });

  test('unsupported file type is rejected', async ({ page }) => {
    await openTool(page, 'image-compressor');
    await uploadFiles(page, fixture.notesTxt);
    await expect(page.getByText(/not a supported|not supported|invalid|cannot/i).first()).toBeVisible();
    await screenshot(page, 'shared-dropzone-unsupported');
  });

  test('empty file is rejected', async ({ page }) => {
    await openTool(page, 'image-compressor');
    await uploadFiles(page, fixture.empty);
    await expect(page.getByText(/empty or too small/i)).toBeVisible();
  });

  test('process action is unavailable until a file is added', async ({ page }) => {
    await openTool(page, 'pdf-merger');
    await expect(page.getByLabel(/upload files/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /merge pdf files/i })).toHaveCount(0);
  });

  test('dropzone is keyboard focusable, shows a focus ring, and Enter or Space opens the file chooser', async ({
    page,
  }) => {
    await openTool(page, 'image-converter');
    const zone = page.getByLabel(/upload files/i);
    await expect(zone).toBeVisible();
    await expect(zone).toHaveAttribute('tabindex', '0');

    const focusDropzone = async () => {
      await page.evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur?.();
      });
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
        if (await zone.evaluate((el) => el === document.activeElement)) return;
      }
      throw new Error('FileDropzone was not reached by Tab');
    };

    await focusDropzone();
    await expect(zone).toBeFocused();

    const focusStyle = await zone.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        outlineWidth: parseFloat(style.outlineWidth) || 0,
        outlineStyle: style.outlineStyle,
      };
    });
    expect(focusStyle.outlineStyle).not.toBe('none');
    expect(focusStyle.outlineWidth).toBeGreaterThan(0);
    await screenshot(page, 'dropzone-keyboard-focus');

    const enterChooser = page.waitForEvent('filechooser');
    await page.keyboard.press('Enter');
    await (await enterChooser).setFiles(fixture.png);
    await expect(page.getByText(/red-800x600\.png/i)).toBeVisible();

    await page.getByRole('button', { name: /^reset$/i }).click();
    await expect(zone).toBeVisible();
    await focusDropzone();
    const spaceChooser = page.waitForEvent('filechooser');
    await page.keyboard.press('Space');
    await (await spaceChooser).setFiles(fixture.jpeg);
    await expect(page.getByText(/blue-400x400\.jpg/i)).toBeVisible();
  });
});

test.describe('Stage 6 navigation, theme, viewports, search', () => {
  test('header search opens tools directory', async ({ page }) => {
    await page.goto('/');
    const search = page.getByRole('button', { name: /search/i }).first();
    if (await search.count()) {
      await search.click();
    } else {
      await page.keyboard.press('Meta+K');
    }
    await page.waitForURL(/\/tools/);
    await expect(page.getByRole('searchbox', { name: 'Search tools' })).toBeVisible();
  });

  test('tools directory search filters compressor', async ({ page }) => {
    await page.goto('/tools');
    await page.getByRole('searchbox', { name: 'Search tools' }).fill('compressor');
    const directory = page.locator('main');
    await expect(directory.locator('a[href="/image-compressor"]').first()).toBeVisible();
    await expect(directory.locator('a[href="/gst-calculator"]')).toHaveCount(0);
  });

  test('theme toggle switches html class or data attribute', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /theme|dark|light/i }).first();
    await expect(toggle).toBeVisible();
    const before = await page.locator('html').getAttribute('class');
    await toggle.click();
    await page.waitForTimeout(200);
    const after = await page.locator('html').getAttribute('class');
    expect(before === after && (await page.locator('html').getAttribute('data-theme')) === null).toBeFalsy();
    await screenshot(page, 'theme-toggled');
  });

  test('footer links are not dead', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    const privacy = footer.locator('a[href="/privacy"]');
    await expect(privacy).toBeVisible();
    await privacy.click();
    await expect(page).toHaveURL(/\/privacy/);
  });

  test('browser back/forward between home and a tool', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/word-counter"]').first().click();
    await expect(page).toHaveURL(/\/word-counter/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/word-counter/);
  });

  test('mobile viewport homepage does not overflow horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await screenshot(page, 'homepage-mobile');
    expect(overflow).toBeLessThanOrEqual(8);
  });

  test('tablet viewport tool page', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/emi-calculator');
    await expect(page.locator('h1').first()).toBeVisible();
    await screenshot(page, 'emi-tablet');
  });
});
