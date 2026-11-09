import fs from 'fs';
import path from 'path';
import { expect, Page, Download } from '@playwright/test';
import { SCREENSHOTS } from './paths';

export type ConsoleBucket = {
  errors: string[];
  warnings: string[];
  failedRequests: string[];
};

export function attachDiagnostics(page: Page): ConsoleBucket {
  const bucket: ConsoleBucket = { errors: [], warnings: [], failedRequests: [] };
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') bucket.errors.push(text);
    if (msg.type() === 'warning') bucket.warnings.push(text);
  });
  page.on('pageerror', (err) => {
    bucket.errors.push(err.message);
  });
  page.on('requestfailed', (req) => {
    bucket.failedRequests.push(`${req.failure()?.errorText || 'failed'} ${req.url()}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      bucket.failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });
  return bucket;
}

export function ignoreBenignConsole(bucket: ConsoleBucket): string[] {
  const noise = [
    /Download the React DevTools/i,
    /Failed to load resource: the server responded with a status of 4/i,
    /net::ERR_/,
    /Google Analytics/i,
    /gtag/i,
    /G-\w+/,
  ];
  return bucket.errors.filter((e) => !noise.some((re) => re.test(e)));
}

export async function openTool(page: Page, slug: string) {
  const response = await page.goto(`/${slug}`, { waitUntil: 'domcontentloaded' });
  return response;
}

export async function screenshot(page: Page, name: string) {
  fs.mkdirSync(SCREENSHOTS, { recursive: true });
  const dest = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: dest, fullPage: true });
  return dest;
}

export async function uploadFiles(page: Page, files: string | string[]) {
  const input = page.locator('input[type="file"]').first();
  await expect(input).toBeAttached();
  await input.setInputFiles(files);
}

export async function clickProcess(page: Page, label: string | RegExp) {
  const button = page.getByRole('button', { name: label });
  await expect(button).toBeEnabled({ timeout: 15_000 });
  await button.click();
}

export async function waitForDownload(page: Page, click: () => Promise<void>): Promise<Download> {
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), click()]);
  return download;
}

export async function saveDownload(download: Download, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await download.saveAs(dest);
  return dest;
}

export async function fillLabeled(page: Page, label: string | RegExp, value: string) {
  const field = page.getByLabel(label);
  await field.fill('');
  await field.fill(value);
}

export function indianMoney(n: number, digits = 2): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
