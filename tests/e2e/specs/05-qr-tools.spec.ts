import { test, expect } from '@playwright/test';
import path from 'path';
import { OUTPUTS } from '../helpers/paths';
import { decodeQrPng } from '../helpers/verify';
import { openTool, saveDownload, screenshot, waitForDownload } from '../helpers/app';

test.describe('T-11 QR Code Generator', () => {
  test('URL QR decodes to the entered URL', async ({ page }) => {
    const payload = 'https://docswala.net/qa-qr';
    await openTool(page, 'qr-code-generator');
    const urlField = page.getByLabel(/website url|any text/i);
    await urlField.fill(payload);
    await expect(page.locator('canvas, img').first()).toBeVisible({ timeout: 15_000 });
    const dest = path.join(OUTPUTS, 'qr-code-generator', 'url.png');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /download png/i }).click()
    );
    await saveDownload(download, dest);
    const decoded = await decodeQrPng(dest);
    expect(decoded).toBe(payload);
    await screenshot(page, 't11-qr-url');
  });
});

test.describe('T-18 UPI QR Code Generator', () => {
  test('UPI QR contains the VPA', async ({ page }) => {
    await openTool(page, 'upi-qr-code-generator');
    await page.getByLabel(/upi id/i).fill('qa@upi');
    await page.getByLabel(/payee name/i).fill('QA Shop');
    const amount = page.getByLabel(/amount/i);
    if (await amount.count()) await amount.fill('99');
    await expect(page.locator('canvas, img').first()).toBeVisible({ timeout: 15_000 });
    const dest = path.join(OUTPUTS, 'upi-qr-code-generator', 'upi.png');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /download png/i }).click()
    );
    await saveDownload(download, dest);
    const decoded = await decodeQrPng(dest);
    expect(decoded, 'QR must decode').toBeTruthy();
    expect(decoded).toMatch(/upi:\/\//i);
    expect(decoded).toMatch(/qa@upi/i);
    await screenshot(page, 't18-upi-qr');
  });
});
