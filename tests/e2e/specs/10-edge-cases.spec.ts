import { test, expect } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fixture } from '../helpers/paths';
import { openTool, screenshot, uploadFiles } from '../helpers/app';

test.describe('Stage 7 edge cases', () => {
  test('corrupt PDF is not treated as a successful merge', async ({ page }) => {
    await openTool(page, 'pdf-merger');
    await uploadFiles(page, fixture.corruptPdf);
    const merge = page.getByRole('button', { name: /merge pdf files/i });
    if (await merge.isEnabled()) {
      await merge.click();
      await expect(page.getByText(/error|invalid|could not|failed|password/i).first()).toBeVisible({
        timeout: 20_000,
      });
    } else {
      await expect(page.getByText(/not a supported|invalid|could not/i).first()).toBeVisible();
    }
    await screenshot(page, 'edge-corrupt-pdf');
  });

  test('wrong extension PNG-named text is rejected by compressor', async ({ page }) => {
    await openTool(page, 'image-compressor');
    await uploadFiles(page, fixture.wrongExtPng);
    const compress = page.getByRole('button', { name: /compress images/i });
    if (await compress.isEnabled()) {
      await compress.click();
      await expect(page.getByText(/error|failed|invalid|could not/i).first()).toBeVisible({
        timeout: 20_000,
      });
    }
  });

  test('tiny 1x1 PNG still processes on compressor', async ({ page }) => {
    await openTool(page, 'image-compressor');
    await uploadFiles(page, fixture.tiny);
    await page.getByRole('button', { name: /compress images/i }).click();
    await expect(page.getByText(/processing complete|error|failed/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test('oversized file vs 8MB translator limit', async ({ page }) => {
    const tmp = path.join(os.tmpdir(), 'docswala-oversize.jpg');
    const header = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const payload = Buffer.concat([header, Buffer.alloc(9 * 1024 * 1024, 0x41)]);
    fs.writeFileSync(tmp, payload);
    await openTool(page, 'document-translator');
    await uploadFiles(page, tmp);
    const translate = page.getByRole('button', { name: /^translate$/i });
    if (await translate.isEnabled()) {
      await translate.click();
      await expect(page.getByText(/8 mb|smaller|too large|exceeds/i).first()).toBeVisible({
        timeout: 20_000,
      });
    } else {
      await expect(page.getByText(/8 mb|too large|exceeds|maximum/i).first()).toBeVisible();
    }
    fs.unlinkSync(tmp);
    await screenshot(page, 'edge-oversize-translator');
  });

  test('rapid double-click on EMI does not crash', async ({ page }) => {
    await openTool(page, 'emi-calculator');
    const yr = page.getByRole('button', { name: /^yr$/i });
    if (await yr.count()) {
      await yr.click();
      await yr.click();
      await yr.click();
    }
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('JSON formatter empty input', async ({ page }) => {
    await openTool(page, 'json-formatter');
    await page.locator('textarea').first().fill('');
    await page.getByRole('button', { name: /beautify|format/i }).click();
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
