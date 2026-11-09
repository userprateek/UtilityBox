import fs from 'fs';
import { test, expect } from '@playwright/test';
import { openTool, uploadFiles } from '../../helpers/app';
import { gen } from './helper';

test.describe('Master translator validation', () => {
  test('TR-04 eleven pages are rejected', async ({ page }) => {
    test.skip(!fs.existsSync(gen('eleven-page.pdf')), 'fixture missing');
    await openTool(page, 'document-translator');
    await uploadFiles(page, gen('eleven-page.pdf'));
    await page.getByLabel(/document language/i).selectOption('en');
    await page.getByLabel(/translate into/i).selectOption('hi');
    await page.getByRole('button', { name: /^translate$/i }).click();
    await expect(page.getByText(/at most 10 pages/i)).toBeVisible({ timeout: 30_000 });
  });

  test('TR-05 empty pdf is rejected', async ({ page }) => {
    await openTool(page, 'document-translator');
    await uploadFiles(page, gen('empty.pdf'));
    await expect(page.getByText(/empty/i)).toBeVisible();
  });

  test('TR-06 encrypted pdf is refused', async ({ page }) => {
    test.skip(!fs.existsSync(gen('encrypted.pdf')), 'encrypt fixture missing');
    await openTool(page, 'document-translator');
    await uploadFiles(page, gen('encrypted.pdf'));
    await page.getByRole('button', { name: /^translate$/i }).click();
    await expect(page.getByText(/password-protected/i)).toBeVisible({ timeout: 30_000 });
  });

  test('TR-07 target list has no auto option', async ({ page }) => {
    await openTool(page, 'document-translator');
    const target = page.getByLabel(/translate into/i);
    const labels = await target.locator('option').allTextContents();
    expect(labels.join(' ')).not.toMatch(/auto/i);
  });
});
