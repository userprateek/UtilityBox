import { test, expect } from '@playwright/test';
import path from 'path';
import { fixture, OUTPUTS } from '../helpers/paths';
import { inspectImage, inspectPdf } from '../helpers/verify';
import { clickProcess, openTool, saveDownload, screenshot, uploadFiles, waitForDownload } from '../helpers/app';

async function processShell(page: import('@playwright/test').Page, processName: RegExp) {
  await clickProcess(page, processName);
  await expect(page.getByText(/processing complete/i)).toBeVisible({ timeout: 60_000 });
}

test.describe('T-06 PDF Merger', () => {
  test('merges two PDFs preserving page count and order', async ({ page }) => {
    await openTool(page, 'pdf-merger');
    await uploadFiles(page, [fixture.pdf1, fixture.pdf2]);
    await processShell(page, /merge pdf files/i);
    const dest = path.join(OUTPUTS, 'pdf-merger', 'merged.pdf');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /download processed file|^download$/i }).first().click()
    );
    await saveDownload(download, dest);
    const info = await inspectPdf(dest);
    expect(info.magic).toBe('pdf');
    expect(info.pageCount).toBe(3);
    await screenshot(page, 't06-merger-done');
  });
});

test.describe('T-07 PDF Splitter', () => {
  test('splits a 3-page PDF into individual pages', async ({ page }) => {
    await openTool(page, 'pdf-splitter');
    await uploadFiles(page, fixture.pdf3);
    await processShell(page, /split pdf document/i);
    const dest = path.join(OUTPUTS, 'pdf-splitter', 'page-1.pdf');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /^download$/i }).first().click()
    );
    await saveDownload(download, dest);
    const info = await inspectPdf(dest);
    expect(info.magic).toBe('pdf');
    expect(info.pageCount).toBe(1);
    await screenshot(page, 't07-splitter-done');
  });
});

test.describe('T-08 PDF to Image', () => {
  test('converts a 2-page PDF into JPEG images', async ({ page }) => {
    await openTool(page, 'pdf-to-image');
    await uploadFiles(page, fixture.pdf2);
    await processShell(page, /convert pdf to images/i);
    const dest = path.join(OUTPUTS, 'pdf-to-image', 'page-1.jpg');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /^download$/i }).first().click()
    );
    await saveDownload(download, dest);
    const info = await inspectImage(dest);
    expect(['jpeg', 'png']).toContain(info.magic);
    expect(info.width).toBeGreaterThan(10);
    await screenshot(page, 't08-pdf-to-image-done');
  });
});

test.describe('T-09 Image to PDF', () => {
  test('converts two images into a 2-page PDF', async ({ page }) => {
    await openTool(page, 'image-to-pdf');
    await uploadFiles(page, [fixture.jpeg, fixture.png]);
    await processShell(page, /convert to pdf/i);
    const dest = path.join(OUTPUTS, 'image-to-pdf', 'from-images.pdf');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /download processed file|^download$/i }).first().click()
    );
    await saveDownload(download, dest);
    const info = await inspectPdf(dest);
    expect(info.magic).toBe('pdf');
    expect(info.pageCount).toBe(2);
    await screenshot(page, 't09-image-to-pdf-done');
  });
});
