import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { fixture } from '../../helpers/paths';
import { decodeQrPng, rfc4122v4 } from '../../helpers/verify';
import { openTool, uploadFiles } from '../../helpers/app';
import { OUT, tempBytes } from './helper';

test.describe('Master QR, text, and developer cases', () => {
  test('QR-01 WhatsApp payload', async ({ page }) => {
    await openTool(page, 'qr-code-generator');
    await page.getByRole('button', { name: /whatsapp/i }).click();
    await page.getByPlaceholder('e.g. 919036593930').fill('+91 98765 43210');
    await page.getByPlaceholder(/printing\/xerox/i).fill('Hello Docs');
    await page.getByRole('button', { name: /none/i }).click().catch(() => undefined);
    const dest = path.join(OUT, 'qr', 'wa.png');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download/i }).first().click(),
    ]);
    await download.saveAs(dest);
    expect(await decodeQrPng(dest)).toBe('https://wa.me/919876543210?text=Hello%20Docs');
  });

  test('QR-02 WiFi payload', async ({ page }) => {
    await openTool(page, 'qr-code-generator');
    await page.getByRole('button', { name: /wifi/i }).click();
    await page.getByPlaceholder('e.g. Shop_Guest_WiFi').fill('Cafe:Net');
    await page.getByPlaceholder('Enter WiFi password').fill('a;b');
    const dest = path.join(OUT, 'qr', 'wifi.png');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download/i }).first().click(),
    ]);
    await download.saveAs(dest);
    expect(await decodeQrPng(dest)).toBe('WIFI:T:WPA;S:Cafe\\:Net;P:a\\;b;;');
  });

  test('QR-03 phone payload', async ({ page }) => {
    await openTool(page, 'qr-code-generator');
    await page.getByRole('button', { name: /phone call/i }).click();
    await page.getByPlaceholder('e.g. +91 98765 43210').fill('+91-90000-11111');
    const dest = path.join(OUT, 'qr', 'tel.png');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download/i }).first().click(),
    ]);
    await download.saveAs(dest);
    expect(await decodeQrPng(dest)).toBe('tel:+919000011111');
  });

  test('QR-04 cleared URL falls back to the site URL', async ({ page }) => {
    await openTool(page, 'qr-code-generator');
    await page.getByPlaceholder(/website link/i).fill('');
    const dest = path.join(OUT, 'qr', 'empty.png');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download/i }).first().click(),
    ]);
    await download.saveAs(dest);
    expect(await decodeQrPng(dest)).toBe('https://docswala.net');
  });

  test('QR-06 UPI without amount', async ({ page }) => {
    await openTool(page, 'upi-qr-code-generator');
    await page.getByPlaceholder(/okhdfcbank/i).fill('qa@upi');
    await page.getByPlaceholder(/Sharma Cyber/i).fill('QA Shop');
    await page.getByPlaceholder(/customer to enter amount/i).fill('');
    const dest = path.join(OUT, 'qr', 'upi-no-amount.png');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download/i }).first().click(),
    ]);
    await download.saveAs(dest);
    const payload = await decodeQrPng(dest);
    expect(payload).toContain('pa=qa@upi');
    expect(payload).not.toContain('am=');
  });

  test('QR-08 download is PNG', async ({ page }) => {
    await openTool(page, 'qr-code-generator');
    const dest = path.join(OUT, 'qr', 'png-check.png');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download/i }).first().click(),
    ]);
    await download.saveAs(dest);
    expect(fs.readFileSync(dest).subarray(0, 4).toString('hex')).toBe('89504e47');
  });

  test('TXT-01 full word stats', async ({ page }) => {
    await openTool(page, 'word-counter');
    const sample = 'Alpha beta gamma.\n\nDelta delta.';
    const box = page.locator('textarea');
    await expect(box).toBeVisible();
    await expect(async () => {
      await box.fill(sample);
      await expect(box).toHaveValue(sample);
    }).toPass();
    await expect(page.getByTestId('word-count')).toHaveText('5');
    await expect(page.getByTestId('sentence-count')).toHaveText('2');
    await expect(page.getByTestId('paragraph-count')).toHaveText('2');
    await expect(page.getByTestId('char-count')).toHaveText(String(sample.length));
  });

  test('TXT-03 sentence camel kebab', async ({ page }) => {
    await openTool(page, 'case-converter');
    await page.locator('textarea').fill('hello WORLD. next line');
    await page.getByRole('button', { name: /sentence case/i }).click();
    await expect(page.locator('textarea')).toHaveValue('Hello world. Next line');
    await page.locator('textarea').fill('Hello world_test');
    await page.getByRole('button', { name: 'camelCase' }).click();
    await expect(page.locator('textarea')).toHaveValue('helloWorldTest');
    await page.getByRole('button', { name: /revert/i }).click();
    await page.getByRole('button', { name: 'kebab-case' }).click();
    await expect(page.locator('textarea')).toHaveValue('hello-world-test');
  });

  test('TXT-06 sort lines', async ({ page }) => {
    await openTool(page, 'remove-duplicates');
    await page.locator('textarea').fill('c\na\nb');
    await page.getByRole('button', { name: /sort lines/i }).click();
    await expect(page.locator('textarea')).toHaveValue('a\nb\nc');
  });

  test('TXT-07 blanks and case', async ({ page }) => {
    await openTool(page, 'remove-duplicates');
    await page.locator('textarea').fill('a\n\na\nA');
    await page.getByRole('button', { name: /remove duplicate/i }).click();
    await expect(page.locator('textarea')).toHaveValue('a\n\nA');
  });

  test('DEV-01 JSON indent', async ({ page }) => {
    await openTool(page, 'json-formatter');
    await page.locator('textarea').fill('{"a":1,"b":{"c":2}}');
    await page.getByRole('button', { name: /4 spaces/i }).click();
    await page.getByRole('button', { name: /beautify/i }).click();
    const value = await page.locator('textarea').inputValue();
    expect(value).toBe(JSON.stringify({ a: 1, b: { c: 2 } }, null, 4));
  });

  test('DEV-03 trailing comma', async ({ page }) => {
    await openTool(page, 'json-formatter');
    await page.locator('textarea').fill('{ "a": 1, }');
    await page.getByRole('button', { name: /beautify/i }).click();
    await expect(page.getByText(/invalid|error|unexpected/i).first()).toBeVisible();
    expect(await page.locator('textarea').inputValue()).toContain('"a": 1,');
  });

  test('DEV-04 file base64 round trip', async ({ page }) => {
    await openTool(page, 'base64-converter');
    await page.getByRole('button', { name: /file/i }).click();
    await uploadFiles(page, fixture.png);
    const dataUrl = await page.locator('pre').innerText();
    const b64 = dataUrl.split(',')[1] || '';
    const decoded = Buffer.from(b64, 'base64');
    expect(decoded.equals(fs.readFileSync(fixture.png))).toBe(true);
  });

  test('DEV-05 unicode and garbage base64', async ({ page }) => {
    await openTool(page, 'base64-converter');
    await page.locator('textarea').first().fill('हिन्दी');
    await page.getByRole('button', { name: /encode to base64/i }).click();
    const encoded = await page.locator('textarea').nth(1).inputValue();
    await page.locator('textarea').first().fill(encoded);
    await page.getByRole('button', { name: /decode from base64/i }).click();
    await expect(page.locator('textarea').nth(1)).toHaveValue('हिन्दी');
    await page.locator('textarea').first().fill('@@@@');
    await page.getByRole('button', { name: /decode from base64/i }).click();
    await expect(page.getByText(/failed|invalid|error/i).first()).toBeVisible();
  });

  test('DEV-07 UUID batch sizes', async ({ page }) => {
    await openTool(page, 'uuid');
    for (const count of [1, 10, 20]) {
      await page.getByRole('button', { name: new RegExp(`^${count} UUIDs?$`) }).click();
      const lines = (await page.locator('body').innerText())
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => rfc4122v4(line));
      expect(lines).toHaveLength(count);
      expect(new Set(lines).size).toBe(count);
    }
  });

  test('DEV-09 broken percent encoding', async ({ page }) => {
    await openTool(page, 'url-encoder');
    await page.locator('textarea').fill('%');
    await page.getByRole('button', { name: /decode url/i }).click();
    await expect(page.getByText(/invalid percent-encoded/i)).toBeVisible();
  });

  test('DEV-11 two-part JWT is rejected', async ({ page }) => {
    const part = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: 'qa' })).toString('base64url');
    await openTool(page, 'jwt-decoder');
    await page.locator('textarea').fill(`${part}.${payload}`);
    await expect(page.getByText(/expected header\.payload\.signature/i)).toBeVisible();
    await expect(page.getByText(/"sub"/)).toHaveCount(0);
  });

  test('DEV-12 bad signature does not look verified', async ({ page }) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: 'qa-user' })).toString('base64url');
    await openTool(page, 'jwt-decoder');
    await page.locator('textarea').fill(`${header}.${payload}.aaaa`);
    await expect(page.getByText(/qa-user/)).toBeVisible();
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toMatch(/signature (is )?valid|verified|trusted/);
  });
});
