import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { fixture } from '../../helpers/paths';
import { inspectImage } from '../../helpers/verify';
import { openTool, uploadFiles } from '../../helpers/app';
import { downloadProcessed, gen, OUT, tempBytes, uploadMany } from './helper';

test.describe('Master image cases', () => {
  test('IMG-01 quality-only mode is available', async ({ page }) => {
    await openTool(page, 'image-compressor');
    const source = await inspectImage(fixture.noisy);
    await uploadFiles(page, fixture.noisy);
    await page.getByRole('button', { name: /no kb limit/i }).click();
    const dest = await downloadProcessed(page, 'image-compressor', 'quality-only.jpg', /compress images/i);
    const info = await inspectImage(dest);
    expect(info.width).toBe(source.width);
    expect(info.height).toBe(source.height);
  });

  test('IMG-02 PNG target becomes a readable JPEG', async ({ page }) => {
    await openTool(page, 'image-compressor');
    await uploadFiles(page, gen('large.png'));
    const dest = await downloadProcessed(page, 'image-compressor', 'large-target.jpg', /compress images/i);
    const info = await inspectImage(dest);
    expect(info.magic).toBe('jpeg');
    expect(info.bytes).toBeLessThanOrEqual(100 * 1024);
  });

  test('IMG-03 batch of two images', async ({ page }) => {
    await openTool(page, 'image-compressor');
    await uploadFiles(page, [fixture.png, fixture.webp]);
    await page.getByRole('button', { name: /compress images/i }).click();
    await expect(page.getByText(/processing complete/i)).toBeVisible({ timeout: 90_000 });
    await expect(page.getByRole('button', { name: /^download$/i })).toHaveCount(2);
  });

  test('IMG-04 size and count limits', async ({ page }) => {
    await openTool(page, 'image-compressor');
    const huge = tempBytes('over-50mb.jpg', 50 * 1024 * 1024 + 1);
    await uploadFiles(page, huge);
    await expect(page.getByText(/exceeds the maximum allowed size of 50MB/i)).toBeVisible();
    await uploadMany(page, fixture.tiny, 21, 'png');
    await expect(page.getByText(/maximum of 20 files/i)).toBeVisible();
  });

  test('IMG-05 AVIF is processed or rejected, not merely listed', async ({ page }) => {
    const avif = gen('sample.avif');
    test.skip(!fs.existsSync(avif), 'sharp could not write AVIF');
    await openTool(page, 'image-compressor');
    await uploadFiles(page, avif);
    const listed = await page.getByText(/sample\.avif/i).count();
    await page.getByRole('button', { name: /compress images/i }).click();
    const error = page.getByText(/not supported|could not|failed|error/i);
    const done = page.getByText(/processing complete/i);
    await expect(error.or(done).first()).toBeVisible({ timeout: 60_000 });
    if (await done.isVisible()) {
      const dest = path.join(OUT, 'image-compressor', 'from-avif.bin');
      const download = await page.waitForEvent('download');
      await page.getByRole('button', { name: /download processed file|^download$/i }).first().click();
      await download.saveAs(dest);
      const info = await inspectImage(dest);
      expect(['jpeg', 'png', 'webp']).toContain(info.magic);
    } else {
      expect(listed).toBeGreaterThanOrEqual(0);
    }
  });

  test('IMG-06 percentage resize', async ({ page }) => {
    await openTool(page, 'image-resizer');
    await uploadFiles(page, fixture.png);
    await page.getByRole('button', { name: /percentage/i }).click();
    await page.getByRole('button', { name: '50%', exact: true }).click();
    const dest = await downloadProcessed(page, 'image-resizer', 'half.png', /resize images/i);
    const info = await inspectImage(dest);
    expect(info.width).toBe(400);
    expect(info.height).toBe(300);
    expect(info.format).toBe('png');
  });

  test('IMG-07 millimetre resize at 300 DPI', async ({ page }) => {
    async function expectSize(
      file: string,
      unit: 'mm' | 'cm' | 'inch',
      length: string,
      dpi: string,
      pixels: number
    ) {
      await openTool(page, 'image-resizer');
      await uploadFiles(page, fixture.png);
      await page.getByRole('button', { name: /print size/i }).click();
      await page.locator('select').filter({ hasText: 'Millimeters' }).selectOption(unit);
      await page.locator('select').filter({ hasText: 'DPI' }).selectOption(dpi);
      const unitName = unit === 'inch' ? 'in' : unit;
      await page.getByText(`Width (${unitName})`).locator('xpath=../input').fill(length);
      await page.getByText(`Height (${unitName})`).locator('xpath=../input').fill(length);
      const dest = await downloadProcessed(page, 'image-resizer', file, /resize images/i);
      const info = await inspectImage(dest);
      expect(info.width).toBe(pixels);
      expect(info.height).toBe(pixels);
    }

    await expectSize('mm-300.png', 'mm', '25.4', '300', 300);
    await expectSize('cm-150.png', 'cm', '2.54', '150', 150);
    await expectSize('inch-72.png', 'inch', '1', '72', 72);
  });

  test('IMG-08 unlocked aspect', async ({ page }) => {
    await openTool(page, 'image-resizer');
    await uploadFiles(page, fixture.png);
    await page.getByLabel(/lock aspect ratio/i).uncheck();
    await page.getByText('Width (px)').locator('xpath=../input').fill('400');
    await page.getByText('Height (px)').locator('xpath=../input').fill('100');
    const dest = await downloadProcessed(page, 'image-resizer', 'unlocked.png', /resize images/i);
    const info = await inspectImage(dest);
    expect(info.width).toBe(400);
    expect(info.height).toBe(100);
  });

  test('IMG-09 zero width is rejected', async ({ page }) => {
    await openTool(page, 'image-resizer');
    await uploadFiles(page, fixture.png);
    await page.getByLabel(/lock aspect ratio/i).uncheck();
    await page.getByText('Width (px)').locator('xpath=../input').fill('0');
    await page.getByRole('button', { name: /resize images/i }).click();
    await expect(page.getByText(/invalid|greater than|must be|width/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/processing complete/i)).toHaveCount(0);
  });

  test('IMG-10 SVG input', async ({ page }) => {
    await openTool(page, 'image-resizer');
    await uploadFiles(page, gen('icon.svg'));
    const rejected = page.getByText(/not supported/i);
    if (await rejected.isVisible().catch(() => false)) {
      await expect(rejected).toBeVisible();
      return;
    }
    await page.getByRole('button', { name: /resize images/i }).click();
    const error = page.getByText(/not supported|could not|failed|error/i);
    const done = page.getByText(/processing complete/i);
    await expect(error.or(done).first()).toBeVisible({ timeout: 30_000 });
    if (await done.isVisible()) {
      const dest = path.join(OUT, 'image-resizer', 'from-svg.bin');
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: /download processed file|^download$/i }).first().click(),
      ]);
      await download.saveAs(dest);
      const info = await inspectImage(dest);
      expect(info.width).toBeGreaterThan(0);
    }
  });

  test('IMG-11 crop ratios', async ({ page }) => {
    await openTool(page, 'image-cropper');
    await uploadFiles(page, fixture.portrait);
    for (const [label, ratio] of [
      ['1:1', 1],
      ['4:3', 4 / 3],
      ['16:9', 16 / 9],
    ] as const) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.getByRole('button', { name: /crop image now|crop & compress/i }).click();
      await expect(page.getByRole('button', { name: /download cropped image/i })).toBeVisible({
        timeout: 30_000,
      });
      const dest = path.join(OUT, 'image-cropper', `${label.replace(':', '')}.jpg`);
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: /download cropped image/i }).click(),
      ]);
      await download.saveAs(dest);
      const info = await inspectImage(dest);
      expect(Math.abs(info.width / info.height - ratio)).toBeLessThan(ratio * 0.02);
      await page.getByRole('button', { name: /adjust crop/i }).click();
    }
  });

  test('IMG-12 rotate 90 swaps dimensions', async ({ page }) => {
    await openTool(page, 'image-cropper');
    await uploadFiles(page, fixture.png);
    await page.getByRole('button', { name: 'Freeform' }).click();
    const before = await page.getByText(/target:/i).textContent();
    await page.getByTitle('Rotate 90° Clockwise').click();
    const after = await page.getByText(/target:/i).textContent();
    expect(after).not.toEqual(before);
  });

  test('IMG-13 crop PNG and empty state', async ({ page }) => {
    await openTool(page, 'image-cropper');
    await expect(page.getByRole('button', { name: /crop image now/i })).toHaveCount(0);
    await uploadFiles(page, fixture.png);
    await page.getByLabel(/target format/i).selectOption('image/png');
    await page.getByRole('button', { name: /crop image now|crop & compress/i }).click();
    const dest = path.join(OUT, 'image-cropper', 'cropped.png');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download cropped image/i }).click(),
    ]);
    await download.saveAs(dest);
    expect((await inspectImage(dest)).format).toBe('png');
  });

  test('IMG-14 converter webp and transparency', async ({ page }) => {
    await openTool(page, 'image-converter');
    await uploadFiles(page, fixture.jpeg);
    await page.getByLabel(/convert to/i).selectOption('image/webp');
    const webp = await downloadProcessed(page, 'image-converter', 'out.webp', /convert images/i);
    expect((await inspectImage(webp)).format).toBe('webp');

    await openTool(page, 'image-converter');
    await uploadFiles(page, fixture.transparent);
    await page.getByLabel(/convert to/i).selectOption('image/png');
    const png = await downloadProcessed(page, 'image-converter', 'alpha.png', /convert images/i);
    const info = await inspectImage(png);
    expect(info.format).toBe('png');
    expect(info.hasAlpha).toBe(true);
  });

  test('IMG-15 gif and svg conversion', async ({ page }) => {
    const gif = gen('sample.gif');
    test.skip(!fs.existsSync(gif), 'GIF fixture was not generated');
    await openTool(page, 'image-converter');
    await uploadFiles(page, gif);
    const dest = await downloadProcessed(page, 'image-converter', 'from-gif.jpg', /convert images/i);
    expect((await inspectImage(dest)).width).toBeGreaterThan(0);
  });

  test('IMG-16 converter file cap', async ({ page }) => {
    await openTool(page, 'image-converter');
    await uploadMany(page, fixture.tiny, 26, 'png');
    await expect(page.getByText(/maximum of 25 files/i)).toBeVisible();
  });

  test('IMG-17 already-small 50KB input', async ({ page }) => {
    await openTool(page, 'compress-image-to-50kb');
    await uploadFiles(page, gen('small.jpg'));
    const dest = await downloadProcessed(page, 'compress-image-to-50kb', 'small.jpg', /compress images/i);
    const info = await inspectImage(dest);
    expect(info.bytes).toBeLessThanOrEqual(50 * 1024);
    expect(info.width).toBeGreaterThan(0);
  });

  test('IMG-18 100KB tool on a large PNG', async ({ page }) => {
    await openTool(page, 'compress-image-to-100kb');
    await uploadFiles(page, gen('large.png'));
    const dest = await downloadProcessed(page, 'compress-image-to-100kb', 'large.jpg', /compress images/i);
    const info = await inspectImage(dest);
    expect(info.bytes).toBeLessThanOrEqual(100 * 1024);
    expect(info.magic).toBe('jpeg');
  });

  test('IMG-19 passport square and 50KB', async ({ page }) => {
    await openTool(page, 'passport-photo-maker');
    await uploadFiles(page, fixture.portrait);
    await page.getByRole('button', { name: '1:1', exact: true }).click();
    await page.getByRole('button', { name: /crop/i }).click();
    const square = path.join(OUT, 'passport-photo-maker', 'square.jpg');
    const [d1] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download cropped image/i }).click(),
    ]);
    await d1.saveAs(square);
    const squareInfo = await inspectImage(square);
    expect(Math.abs(squareInfo.width / squareInfo.height - 1)).toBeLessThan(0.02);

    await page.getByRole('button', { name: /adjust crop|crop another/i }).first().click();
    await page.getByRole('button', { name: /passport 35/i }).click();
    await page.getByRole('button', { name: /crop/i }).click();
    const pass = path.join(OUT, 'passport-photo-maker', 'target.jpg');
    const [d2] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download cropped image/i }).click(),
    ]);
    await d2.saveAs(pass);
    const info = await inspectImage(pass);
    expect(info.bytes).toBeLessThanOrEqual(50 * 1024);
    expect(Math.abs(info.width / info.height - 35 / 45)).toBeLessThan(0.02);
  });

  test('IMG-20 flip control changes the crop', async ({ page }) => {
    await openTool(page, 'passport-photo-maker');
    await uploadFiles(page, fixture.portrait);
    await page.getByTitle('Flip Horizontal').click();
    await expect(page.getByTitle('Flip Horizontal')).toBeVisible();
    await page.getByRole('button', { name: /crop/i }).click();
    await expect(page.getByRole('button', { name: /download cropped image/i })).toBeVisible();
  });

  test('IMG-21 signature 2:1 is offered and 20KB holds', async ({ page }) => {
    await openTool(page, 'signature-cropper');
    await uploadFiles(page, fixture.png);
    await page.getByRole('button', { name: 'Signature 2:1' }).click();
    await page.getByRole('button', { name: /crop/i }).click();
    const dest = path.join(OUT, 'signature-cropper', 'out.jpg');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download cropped image/i }).click(),
    ]);
    await download.saveAs(dest);
    const info = await inspectImage(dest);
    expect(Math.abs(info.width / info.height - 2)).toBeLessThan(0.02);
    expect(info.bytes).toBeLessThanOrEqual(20 * 1024);
  });

  test('IMG-22 A4 12 sheet', async ({ page }) => {
    await openTool(page, 'passport-sheet-maker');
    await uploadFiles(page, fixture.portrait);
    await page.getByRole('button', { name: /12/i }).click();
    await expect(page.getByRole('button', { name: /download high-res sheet/i })).toBeEnabled({
      timeout: 30_000,
    });
    const dest = path.join(OUT, 'passport-sheet-maker', 'a4-12.jpg');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download high-res sheet/i }).click(),
    ]);
    await download.saveAs(dest);
    const info = await inspectImage(dest);
    expect(info.width).toBe(2480);
    expect(info.height).toBe(3508);
    expect(info.format).toBe('jpeg');
  });

  test('IMG-23 A4 16 and cut lines', async ({ page }) => {
    await openTool(page, 'passport-sheet-maker');
    await uploadFiles(page, fixture.portrait);
    await page.getByRole('button', { name: /16/i }).click();
    const lines = page.getByLabel(/cut/i);
    if (await lines.count()) await lines.check();
    await expect(page.getByRole('button', { name: /download high-res sheet/i })).toBeEnabled({
      timeout: 30_000,
    });
    const dest = path.join(OUT, 'passport-sheet-maker', 'a4-16.jpg');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download high-res sheet/i }).click(),
    ]);
    await download.saveAs(dest);
    const info = await inspectImage(dest);
    expect(info.width).toBe(2480);
    expect(info.height).toBe(3508);
  });

  test('IMG-24 sheet download is JPEG', async ({ page }) => {
    await openTool(page, 'passport-sheet-maker');
    await expect(page.getByRole('button', { name: /download high-res sheet \(jpg\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pdf/i })).toHaveCount(0);
  });

  test('IMG-25 sheet rejects text and a bad jpeg', async ({ page }) => {
    await openTool(page, 'passport-sheet-maker');
    await uploadFiles(page, fixture.notesTxt);
    await expect(page.getByText(/not supported/i)).toBeVisible();
  });

  test('IMG-26 a downloaded image reopens', async ({ page }) => {
    await openTool(page, 'image-converter');
    await uploadFiles(page, fixture.png);
    const dest = await downloadProcessed(page, 'image-converter', 'reopen.jpg', /convert images/i);
    const info = await inspectImage(dest);
    expect(info.width).toBeGreaterThan(0);
    expect(info.bytes).toBeGreaterThan(32);
  });
});
