import { test, expect } from '@playwright/test';
import { openTool, screenshot } from '../helpers/app';

test.describe('T-25 Word Counter', () => {
  test('counts a known string exactly', async ({ page }) => {
    await openTool(page, 'word-counter');
    const area = page.locator('textarea').first();
    await area.click();
    await area.fill('');
    await area.fill('Alpha beta gamma.\n\nDelta delta.');
    const words = page.locator('[class*="statBox"]').filter({ has: page.getByText('Words', { exact: true }) });
    await expect(words.locator('[class*="statNum"]')).toHaveText('5');
    await screenshot(page, 't25-word-counter');
  });

  test('empty text is zero words', async ({ page }) => {
    await openTool(page, 'word-counter');
    const area = page.locator('textarea').first();
    await area.click();
    await area.fill('placeholder');
    await area.fill('');
    const wordBox = page.locator('[class*="statBox"]').filter({ has: page.getByText('Words', { exact: true }) });
    await expect(wordBox.locator('[class*="statNum"]')).toHaveText('0');
  });
});

test.describe('T-26 Case Converter', () => {
  test('UPPERCASE and Title Case match expected strings', async ({ page }) => {
    await openTool(page, 'case-converter');
    const area = page.locator('textarea').first();
    await area.fill('hello WORLD');
    await page.getByRole('button', { name: 'UPPERCASE' }).click();
    await expect(area).toHaveValue('HELLO WORLD');
    await page.getByRole('button', { name: 'Title Case' }).click();
    await expect(area).toHaveValue('Hello World');
    await page.getByRole('button', { name: 'lowercase' }).click();
    await expect(area).toHaveValue('hello world');
    await screenshot(page, 't26-case-converter');
  });
});

test.describe('T-27 Remove Duplicates', () => {
  test('keeps first occurrence of each line', async ({ page }) => {
    await openTool(page, 'remove-duplicates');
    const area = page.locator('textarea').first();
    await area.fill('a\nb\na\nc');
    await page.getByRole('button', { name: /remove duplicate lines/i }).click();
    await expect(area).toHaveValue('a\nb\nc');
    await screenshot(page, 't27-remove-duplicates');
  });
});
