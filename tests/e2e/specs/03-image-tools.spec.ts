import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fixture, OUTPUTS } from '../helpers/paths';
import { inspectImage } from '../helpers/verify';
import {
  clickProcess,
  openTool,
  saveDownload,
  screenshot,
  uploadFiles,
  waitForDownload,
} from '../helpers/app';

async function processAndDownload(page: import('@playwright/test').Page, processName: RegExp, slug: string, file = 'out.bin') {
  await clickProcess(page, processName);
  await expect(page.getByText(/processing complete/i)).toBeVisible({ timeout: 60_000 });
  const dest = path.join(OUTPUTS, slug, file);
  const download = await waitForDownload(page, () =>
    page.getByRole('button', { name: /download processed file|^download$/i }).first().click()
  );
  await saveDownload(download, dest);
  return dest;
}

test.describe('T-01 Image Compressor', () => {
  test('compresses JPEG and yields a valid smaller-or-equal image', async ({ page }) => {
    await openTool(page, 'image-compressor');
    await expect(page.locator('h1')).toContainText(/image compressor/i);
    await uploadFiles(page, fixture.noisy);
    const dest = await processAndDownload(page, /compress images/i, 'image-compressor', 'noisy.jpg');
    const info = await inspectImage(dest);
    const original = fs.statSync(fixture.noisy).size;
    expect(['jpeg', 'png', 'webp']).toContain(info.magic);
    expect(info.width).toBeGreaterThan(0);
    expect(info.bytes).toBeGreaterThan(32);
    expect(info.bytes).toBeLessThanOrEqual(original);
    await screenshot(page, 't01-compressor-done');
  });

  test('accepts PNG and WebP inputs', async ({ page }) => {
    await openTool(page, 'image-compressor');
    await uploadFiles(page, [fixture.png, fixture.webp]);
    await expect(page.getByText(/red-800x600\.png/i).first()).toBeVisible();
    await expect(page.getByText(/green-200x200\.webp/i).first()).toBeVisible();
    await clickProcess(page, /compress images/i);
    await expect(page.getByText(/processing complete/i)).toBeVisible({ timeout: 60_000 });
  });
});

test.describe('T-02 Image Resizer', () => {
  test('resizes 800x600 PNG to 400x300 pixels', async ({ page }) => {
    await openTool(page, 'image-resizer');
    await uploadFiles(page, fixture.png);
    await expect(page.getByText('Width (px)')).toBeVisible();
    await page.getByText('Width (px)').locator('xpath=../input').fill('400');
    await page.getByText('Height (px)').locator('xpath=../input').fill('300');
    const dest = await processAndDownload(page, /resize images/i, 'image-resizer', 'resized.png');
    const info = await inspectImage(dest);
    expect(info.width).toBe(400);
    expect(info.height).toBe(300);
    expect(info.magic).toBe('png');
    expect(info.format).toBe('png');
    await screenshot(page, 't02-resizer-done');
  });

  test('original format keeps JPEG bytes', async ({ page }) => {
    await openTool(page, 'image-resizer');
    await uploadFiles(page, fixture.jpeg);
    await page.getByText('Width (px)').locator('xpath=../input').fill('200');
    await page.getByText('Height (px)').locator('xpath=../input').fill('200');
    const dest = await processAndDownload(page, /resize images/i, 'image-resizer', 'resized-original.jpg');
    const info = await inspectImage(dest);
    expect(info.magic).toBe('jpeg');
    expect(info.format).toBe('jpeg');
    expect(info.width).toBe(200);
    expect(info.height).toBe(200);
  });

  test('original format keeps WebP bytes', async ({ page }) => {
    await openTool(page, 'image-resizer');
    await uploadFiles(page, fixture.webp);
    await page.getByText('Width (px)').locator('xpath=../input').fill('100');
    await page.getByText('Height (px)').locator('xpath=../input').fill('100');
    const dest = await processAndDownload(page, /resize images/i, 'image-resizer', 'resized-original.webp');
    const info = await inspectImage(dest);
    expect(info.magic).toBe('webp');
    expect(info.format).toBe('webp');
    expect(info.width).toBe(100);
    expect(info.height).toBe(100);
  });

  test('an explicitly selected JPEG format converts a PNG', async ({ page }) => {
    await openTool(page, 'image-resizer');
    await uploadFiles(page, fixture.png);
    await page.getByLabel(/output image format/i).selectOption('image/jpeg');
    await page.getByText('Width (px)').locator('xpath=../input').fill('400');
    await page.getByText('Height (px)').locator('xpath=../input').fill('300');
    const dest = await processAndDownload(page, /resize images/i, 'image-resizer', 'resized-explicit.jpg');
    const info = await inspectImage(dest);
    expect(info.magic).toBe('jpeg');
    expect(info.format).toBe('jpeg');
    expect(info.width).toBe(400);
    expect(info.height).toBe(300);
  });
});

test.describe('T-04 Image Converter', () => {
  test('converts PNG to JPEG', async ({ page }) => {
    await openTool(page, 'image-converter');
    await uploadFiles(page, fixture.png);
    const format = page.getByLabel(/convert to/i);
    if (await format.count()) {
      await format.selectOption('image/jpeg');
    }
    const dest = await processAndDownload(page, /convert format/i, 'image-converter', 'converted.jpg');
    const info = await inspectImage(dest);
    expect(info.magic).toBe('jpeg');
    expect(info.format).toBe('jpeg');
    expect(info.hasAlpha).toBeFalsy();
    await screenshot(page, 't04-converter-done');
  });
});

test.describe('T-13 Compress Image to 50KB', () => {
  test('output is a valid image at or under 50KB when source is larger', async ({ page }) => {
    await openTool(page, 'compress-image-to-50kb');
    await uploadFiles(page, fixture.noisy);
    const dest = await processAndDownload(page, /compress images/i, 'compress-image-to-50kb', '50kb.jpg');
    const info = await inspectImage(dest);
    expect(info.width).toBeGreaterThan(0);
    expect(info.bytes).toBeLessThanOrEqual(50 * 1024);
    await screenshot(page, 't13-50kb-done');
  });
});

test.describe('T-14 Compress Image to 100KB', () => {
  test('output is a valid image at or under 100KB when source is larger', async ({ page }) => {
    await openTool(page, 'compress-image-to-100kb');
    await uploadFiles(page, fixture.noisy);
    const dest = await processAndDownload(page, /compress images/i, 'compress-image-to-100kb', '100kb.jpg');
    const info = await inspectImage(dest);
    expect(info.width).toBeGreaterThan(0);
    expect(info.bytes).toBeLessThanOrEqual(100 * 1024);
    await screenshot(page, 't14-100kb-done');
  });
});

test.describe('T-03 Image Cropper', () => {
  test('crops and downloads a smaller valid image', async ({ page }) => {
    await openTool(page, 'image-cropper');
    await uploadFiles(page, fixture.png);
    await expect(page.getByRole('img', { name: /crop|preview|upload/i }).or(page.locator('img').first())).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /crop image now/i }).click();
    await expect(page.getByRole('button', { name: /download cropped image/i })).toBeEnabled({ timeout: 30_000 });
    const dest = path.join(OUTPUTS, 'image-cropper', 'cropped.jpg');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /download cropped image/i }).click()
    );
    await saveDownload(download, dest);
    const info = await inspectImage(dest);
    expect(info.width).toBeGreaterThan(0);
    expect(info.height).toBeGreaterThan(0);
    expect(info.width * info.height).toBeLessThan(800 * 600);
    await screenshot(page, 't03-cropper-done');
  });

  test('rotate control is present and clickable', async ({ page }) => {
    await openTool(page, 'image-cropper');
    await uploadFiles(page, fixture.png);
    const rotate = page.getByRole('button', { name: /rotate/i }).first();
    await expect(rotate).toBeVisible();
    await rotate.click();
  });
});

test.describe('T-15 Passport Size Photo Maker', () => {
  test('crops to ~35:45 aspect and produces an image', async ({ page }) => {
    await openTool(page, 'passport-photo-maker');
    await uploadFiles(page, fixture.portrait);
    await page.getByRole('button', { name: /crop/i }).last().click();
    await expect(page.getByRole('button', { name: /download cropped image/i })).toBeEnabled({ timeout: 30_000 });
    const dest = path.join(OUTPUTS, 'passport-photo-maker', 'passport.jpg');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /download cropped image/i }).click()
    );
    await saveDownload(download, dest);
    const info = await inspectImage(dest);
    const ratio = info.width / info.height;
    expect(Math.abs(ratio - 35 / 45)).toBeLessThan(0.08);
    await screenshot(page, 't15-passport-photo-done');
  });
});

test.describe('T-17 Signature Cropper', () => {
  test('crops to ~3:1 aspect', async ({ page }) => {
    await openTool(page, 'signature-cropper');
    await uploadFiles(page, fixture.png);
    await page.getByRole('button', { name: /crop/i }).last().click();
    await expect(page.getByRole('button', { name: /download cropped image/i })).toBeEnabled({ timeout: 30_000 });
    const dest = path.join(OUTPUTS, 'signature-cropper', 'signature.jpg');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /download cropped image/i }).click()
    );
    await saveDownload(download, dest);
    const info = await inspectImage(dest);
    expect(info.width / info.height).toBeGreaterThan(2.4);
    expect(info.width / info.height).toBeLessThan(3.6);
    await screenshot(page, 't17-signature-done');
  });
});

test.describe('T-16 Passport Photo Sheet Generator', () => {
  test('4x6 sheet is 1800x1200 JPEG', async ({ page }) => {
    await openTool(page, 'passport-sheet-maker');
    await uploadFiles(page, fixture.portrait);
    await expect(page.getByRole('button', { name: /download high-res sheet/i })).toBeEnabled({ timeout: 30_000 });
    const dest = path.join(OUTPUTS, 'passport-sheet-maker', 'sheet-4x6.jpg');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /download high-res sheet/i }).click()
    );
    await saveDownload(download, dest);
    const info = await inspectImage(dest);
    expect(info.width).toBe(1800);
    expect(info.height).toBe(1200);
    expect(['jpeg', 'png']).toContain(info.magic);
    await screenshot(page, 't16-sheet-4x6');
  });
});
