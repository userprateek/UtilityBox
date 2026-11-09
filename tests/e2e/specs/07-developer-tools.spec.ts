import { test, expect } from '@playwright/test';
import { rfc4122v4 } from '../helpers/verify';
import { openTool, screenshot } from '../helpers/app';

test.describe('T-10 JSON Formatter', () => {
  test('beautifies valid JSON and rejects invalid JSON', async ({ page }) => {
    await openTool(page, 'json-formatter');
    const area = page.locator('textarea').first();
    await area.fill('{"a":1,"b":[2,3]}');
    await page.getByRole('button', { name: /beautify|format/i }).click();
    const pretty = await area.inputValue();
    expect(JSON.parse(pretty)).toEqual({ a: 1, b: [2, 3] });
    expect(pretty).toMatch(/\n/);
    await page.getByRole('button', { name: /minify/i }).click();
    const mini = await area.inputValue();
    expect(mini.replace(/\s/g, '')).toBe('{"a":1,"b":[2,3]}');

    await area.fill('{ broken');
    await page.getByRole('button', { name: /beautify|format/i }).click();
    await expect(page.getByText(/invalid|error|unexpected/i).first()).toBeVisible();
    await screenshot(page, 't10-json-formatter');
  });
});

test.describe('T-12 Base64 Converter', () => {
  test('encodes and decodes a known string', async ({ page }) => {
    await openTool(page, 'base64-converter');
    const area = page.locator('textarea').first();
    await area.fill('Hello, DocsWala');
    await page.getByRole('button', { name: /encode to base64/i }).click();
    await expect(page.getByText('SGVsbG8sIERvY3NXYWxh')).toBeVisible();
    await screenshot(page, 't12-base64');
  });
});

test.describe('T-28 UUID Generator', () => {
  test('emits RFC 4122 version-4 UUIDs', async ({ page }) => {
    await openTool(page, 'uuid');
    await expect(page.getByRole('button', { name: /5 uuids/i })).toBeVisible();
    const lines = (await page.locator('pre, textarea, [class*="uuid"]').first().innerText())
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /[0-9a-f-]{36}/i.test(l));
    expect(lines.length).toBeGreaterThanOrEqual(5);
    for (const line of lines.slice(0, 5)) {
      expect(rfc4122v4(line), line).toBe(true);
    }
    await page.getByRole('button', { name: /1 uuid/i }).click();
    await screenshot(page, 't28-uuid');
  });
});

test.describe('T-29 URL Encoder', () => {
  test('percent-encodes and decodes a known string', async ({ page }) => {
    await openTool(page, 'url-encoder');
    const area = page.locator('textarea').first();
    await area.fill('hello world?x=1');
    await page.getByRole('button', { name: /encode url/i }).click();
    await expect(area).toHaveValue('hello%20world%3Fx%3D1');
    await page.getByRole('button', { name: /decode url/i }).click();
    await expect(area).toHaveValue('hello world?x=1');
    await screenshot(page, 't29-url-encoder');
  });
});

test.describe('T-30 JWT Decoder', () => {
  test('decodes a known unsigned JWT payload', async ({ page }) => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: 'qa-user', name: 'DocsWala QA' })).toString(
      'base64url'
    );
    const token = `${header}.${payload}.`;
    await openTool(page, 'jwt-decoder');
    await page.locator('textarea').first().fill(token);
    await expect(page.getByText('qa-user')).toBeVisible();
    await expect(page.getByText('DocsWala QA')).toBeVisible();
    await screenshot(page, 't30-jwt');
  });

  test('rejects garbage', async ({ page }) => {
    await openTool(page, 'jwt-decoder');
    await page.locator('textarea').first().fill('not-a-jwt');
    await expect(page.getByText(/invalid|failed|expected header/i).first()).toBeVisible();
  });
});
