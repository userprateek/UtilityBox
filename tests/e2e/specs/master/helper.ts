import fs from 'fs';
import os from 'os';
import path from 'path';
import { expect, Page } from '@playwright/test';
import { clickProcess, saveDownload, uploadFiles, waitForDownload } from '../../helpers/app';

export const GEN = path.resolve('.local/testing/fixtures/master');
export const OUT = path.resolve(
  process.env.MASTER_OUTPUT_DIR || '.local/testing/evidence/master-run/outputs'
);

export function gen(name: string): string {
  return path.join(GEN, name);
}

export async function downloadProcessed(page: Page, slug: string, file: string, processName: RegExp) {
  await clickProcess(page, processName);
  await expect(page.getByText(/processing complete/i)).toBeVisible({ timeout: 90_000 });
  const dest = path.join(OUT, slug, file);
  const download = await waitForDownload(page, () =>
    page.getByRole('button', { name: /download processed file|^download$/i }).first().click()
  );
  await saveDownload(download, dest);
  return dest;
}

export async function downloadAll(page: Page, slug: string) {
  const dir = path.join(OUT, slug, `batch-${Date.now()}`);
  fs.mkdirSync(dir, { recursive: true });
  const downloads: string[] = [];
  page.on('download', (download) => {
    const dest = path.join(dir, download.suggestedFilename());
    downloads.push(dest);
    void download.saveAs(dest);
  });
  await page.getByRole('button', { name: /download all/i }).click();
  await expect.poll(() => downloads.length, { timeout: 20_000 }).toBeGreaterThan(0);
  await page.waitForTimeout(500);
  return downloads;
}

export async function dropFile(page: Page, filePath: string, mime: string) {
  const bytes = Array.from(fs.readFileSync(filePath));
  const name = path.basename(filePath);
  await page.locator('[aria-label="Upload files by clicking or dragging and dropping"]').evaluate(
    (el, payload: { name: string; mime: string; bytes: number[] }) => {
      const dt = new DataTransfer();
      const file = new File([new Uint8Array(payload.bytes)], payload.name, { type: payload.mime });
      dt.items.add(file);
      el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    },
    { name, mime, bytes }
  );
}

export function tempBytes(name: string, size: number): string {
  const dest = path.join(os.tmpdir(), name);
  fs.writeFileSync(dest, Buffer.alloc(size));
  return dest;
}

export async function uploadMany(page: Page, source: string, count: number, ext: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ub-'));
  const files: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const dest = path.join(dir, `f-${i}.${ext}`);
    fs.copyFileSync(source, dest);
    files.push(dest);
  }
  await uploadFiles(page, files);
}
