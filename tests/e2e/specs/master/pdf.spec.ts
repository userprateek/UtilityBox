import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { test, expect } from '@playwright/test';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { readOutlineEntries } from '../../../../lib/pdf/outlines';
import { fixture } from '../../helpers/paths';
import { inspectImage, inspectPdf } from '../../helpers/verify';
import { openTool, uploadFiles } from '../../helpers/app';
import { unzipStored } from '../../../../lib/file/zipStore';
import { downloadAll, downloadProcessed, gen, OUT, tempBytes } from './helper';

async function pageTexts(filePath: string): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const worker = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(worker).href;
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data, verbosity: 0, isOffscreenCanvasSupported: false }).promise;
  const lines: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    lines.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
  }
  return lines;
}

test.describe('Master PDF cases', () => {
  test('PDF-01 reorder changes page text order', async ({ page }) => {
    await openTool(page, 'pdf-merger');
    await uploadFiles(page, [fixture.pdf3, fixture.pdf1]);
    await page.getByRole('button', { name: /move one-page\.pdf earlier/i }).click();
    const dest = await downloadProcessed(page, 'pdf-merger', 'reordered.pdf', /merge pdf/i);
    const info = await inspectPdf(dest);
    expect(info.pageCount).toBe(4);
    const text = await pageTexts(dest);
    expect(text[1]).toMatch(/PAGE ONE/i);
    expect(text[2]).toMatch(/PAGE TWO/i);
  });

  test('PDF-02 single file merge', async ({ page }) => {
    await openTool(page, 'pdf-merger');
    await uploadFiles(page, fixture.pdf2);
    const dest = await downloadProcessed(page, 'pdf-merger', 'single.pdf', /merge pdf/i);
    expect((await inspectPdf(dest)).pageCount).toBe(2);
  });

  test('PDF-03 merger limits', async ({ page }) => {
    await openTool(page, 'pdf-merger');
    const huge = tempBytes('over-100mb.pdf', 100 * 1024 * 1024 + 1);
    await uploadFiles(page, huge);
    await expect(page.getByText(/exceeds the maximum allowed size of 100MB/i)).toBeVisible();
  });

  test('PDF-04 encrypted PDF is refused', async ({ page }) => {
    const locked = gen('encrypted.pdf');
    test.skip(!fs.existsSync(locked), 'pdf-lib could not encrypt');
    await openTool(page, 'pdf-merger');
    await uploadFiles(page, locked);
    await page.getByRole('button', { name: /merge pdf/i }).click();
    await expect(page.getByRole('alert').filter({ hasText: /password-protected/i })).toBeVisible();
    await expect(page.getByText(/processing complete/i)).toHaveCount(0);
  });

  test('PDF-05 bookmarks survive a merge', async ({ page }) => {
    const marked = await PDFDocument.create();
    const markedPage = marked.addPage([200, 200]);
    const outlines = marked.context.obj({ Type: 'Outlines', Count: 1 });
    const outlinesRef = marked.context.register(outlines);
    const item = marked.context.obj({
      Title: PDFString.of('Chapter One'),
      Parent: outlinesRef,
      Dest: marked.context.obj([markedPage.ref, PDFName.of('Fit')]),
    });
    const itemRef = marked.context.register(item);
    outlines.set(PDFName.of('First'), itemRef);
    outlines.set(PDFName.of('Last'), itemRef);
    marked.catalog.set(PDFName.of('Outlines'), outlinesRef);
    const markedPath = path.join(OUT, 'pdf-merger', 'bookmarked-source.pdf');
    fs.mkdirSync(path.dirname(markedPath), { recursive: true });
    fs.writeFileSync(markedPath, await marked.save());

    await openTool(page, 'pdf-merger');
    await uploadFiles(page, [fixture.pdf1, markedPath]);
    const dest = await downloadProcessed(page, 'pdf-merger', 'bookmarks.pdf', /merge pdf/i);
    const merged = await PDFDocument.load(fs.readFileSync(dest));
    expect(merged.getPageCount()).toBe(2);
    expect(readOutlineEntries(merged)).toEqual([{ title: 'Chapter One', pageIndex: 1 }]);
  });

  test('PDF-06 custom range 1-2', async ({ page }) => {
    await openTool(page, 'pdf-splitter');
    await uploadFiles(page, fixture.pdf3);
    await page.getByRole('button', { name: /custom page range/i }).click();
    await page.getByRole('button', { name: '1-2', exact: true }).click();
    const dest = await downloadProcessed(page, 'pdf-splitter', 'range.pdf', /split pdf/i);
    const info = await inspectPdf(dest);
    expect(info.pageCount).toBe(2);
    const text = await pageTexts(dest);
    expect(text.join(' ')).toMatch(/PAGE ONE/);
    expect(text.join(' ')).toMatch(/PAGE TWO/);
    expect(text.join(' ')).not.toMatch(/PAGE THREE/);
  });

  test('PDF-07 interval of 2', async ({ page }) => {
    await openTool(page, 'pdf-splitter');
    await uploadFiles(page, fixture.pdf3);
    await page.getByRole('button', { name: /split every n/i }).click();
    await page.getByRole('button', { name: /every 2 pages/i }).click();
    await page.getByRole('button', { name: /split pdf/i }).click();
    await expect(page.getByText(/processing complete/i)).toBeVisible({ timeout: 30_000 });
    const files = await downloadAll(page, 'pdf-splitter');
    expect(files.length).toBe(2);
    const counts = [];
    for (const file of files) {
      counts.push((await inspectPdf(file)).pageCount);
    }
    expect(counts.sort()).toEqual([1, 2]);
  });

  test('PDF-08 range past the end', async ({ page }) => {
    await openTool(page, 'pdf-splitter');
    await uploadFiles(page, fixture.pdf3);
    await page.getByRole('button', { name: /custom page range/i }).click();
    await page.locator('input[placeholder*="1-3"]').fill('9-12');
    await page.getByRole('button', { name: /split pdf/i }).click();
    await expect(page.getByText(/invalid page range/i)).toBeVisible({ timeout: 20_000 });
  });

  test('PDF-09 empty range is rejected', async ({ page }) => {
    await openTool(page, 'pdf-splitter');
    await uploadFiles(page, fixture.pdf3);
    await page.getByRole('button', { name: /custom page range/i }).click();
    await page.locator('input[placeholder*="1-3"]').fill('');
    await page.getByRole('button', { name: /split pdf/i }).click();
    await expect(page.getByText(/enter a page range|invalid page range|page range/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/processing complete/i)).toHaveCount(0);
  });

  test('PDF-10 separate PDFs and the ZIP discrepancy', async ({ page }) => {
    await openTool(page, 'pdf-splitter');
    await uploadFiles(page, fixture.pdf3);
    await expect(page.getByText(/Download ZIP to save them together/i)).toBeVisible();
    await page.getByRole('button', { name: /split pdf/i }).click();
    await expect(page.getByText(/processing complete/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: /^download$/i })).toHaveCount(3);
    const dest = path.join(OUT, 'pdf-splitter', 'pages.zip');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download zip/i }).click(),
    ]);
    await download.saveAs(dest);
    const entries = unzipStored(fs.readFileSync(dest));
    expect(entries).toHaveLength(3);
    for (const entry of entries) {
      expect(entry.name.endsWith('.pdf')).toBe(true);
      const part = path.join(OUT, 'pdf-splitter', entry.name);
      fs.writeFileSync(part, entry.bytes);
      expect((await inspectPdf(part)).pageCount).toBe(1);
    }
  });

  test('PDF-11 corrupt and non-pdf', async ({ page }) => {
    await openTool(page, 'pdf-splitter');
    await uploadFiles(page, fixture.notesTxt);
    await expect(page.getByText(/not supported/i)).toBeVisible();
    await uploadFiles(page, fixture.corruptPdf);
    await page.getByRole('button', { name: /split pdf/i }).click();
    await expect(page.getByText(/could not|invalid|error|failed/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/processing complete/i)).toHaveCount(0);
  });

  test('PDF-12 PNG of page 1', async ({ page }) => {
    await openTool(page, 'pdf-to-image');
    await uploadFiles(page, fixture.pdf1);
    await page.getByLabel(/output image format/i).selectOption('image/png');
    await page.getByRole('button', { name: /custom|selected pages/i }).click().catch(() => undefined);
    const dest = await downloadProcessed(page, 'pdf-to-image', 'page.png', /convert to images|convert pdf/i);
    const info = await inspectImage(dest);
    expect(info.format).toBe('png');
    const src = await PDFDocument.load(fs.readFileSync(fixture.pdf1));
    const size = src.getPage(0).getSize();
    expect(info.width).toBeGreaterThan(size.width);
  });

  test('PDF-13 DPI scales the render', async ({ page }) => {
    await openTool(page, 'pdf-to-image');
    await uploadFiles(page, fixture.pdf1);
    await page.getByLabel(/render resolution/i).selectOption('72');
    const low = await downloadProcessed(page, 'pdf-to-image', 'dpi72.jpg', /convert/i);
    await openTool(page, 'pdf-to-image');
    await uploadFiles(page, fixture.pdf1);
    await page.getByLabel(/render resolution/i).selectOption('300');
    const high = await downloadProcessed(page, 'pdf-to-image', 'dpi300.jpg', /convert/i);
    const a = await inspectImage(low);
    const b = await inspectImage(high);
    expect(b.width).toBeGreaterThan(a.width * 3);
  });

  test('PDF-14 corrupt pdf to image', async ({ page }) => {
    await openTool(page, 'pdf-to-image');
    await uploadFiles(page, fixture.corruptPdf);
    await page.getByRole('button', { name: /convert/i }).click();
    await expect(page.getByText(/could not|invalid|error|failed/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('PDF-15 A4, letter, and fit', async ({ page }) => {
    await openTool(page, 'image-to-pdf');
    await uploadFiles(page, fixture.png);
    let dest = await downloadProcessed(page, 'image-to-pdf', 'a4.pdf', /convert to pdf/i);
    let size = (await inspectPdf(dest)).pageSizes[0];
    expect(size?.width).toBeCloseTo(595.28, 0);
    expect(size?.height).toBeCloseTo(841.89, 0);

    await openTool(page, 'image-to-pdf');
    await uploadFiles(page, fixture.png);
    await page.getByLabel(/pdf page size/i).selectOption('letter');
    dest = await downloadProcessed(page, 'image-to-pdf', 'letter.pdf', /convert to pdf/i);
    size = (await inspectPdf(dest)).pageSizes[0];
    expect(size?.width).toBeCloseTo(612, 0);
    expect(size?.height).toBeCloseTo(792, 0);

    await openTool(page, 'image-to-pdf');
    await uploadFiles(page, fixture.png);
    await page.getByLabel(/pdf page size/i).selectOption('fit');
    dest = await downloadProcessed(page, 'image-to-pdf', 'fit.pdf', /convert to pdf/i);
    size = (await inspectPdf(dest)).pageSizes[0];
    expect(size?.width).toBeGreaterThan(700);
    expect(size?.height).toBeGreaterThan(500);
  });

  test('PDF-16 two images on one landscape page', async ({ page }) => {
    await openTool(page, 'image-to-pdf');
    await uploadFiles(page, [fixture.png, fixture.jpeg]);
    await page.getByRole('button', { name: /2 images \/ page/i }).click();
    await page.getByLabel(/page orientation/i).selectOption('landscape');
    const dest = await downloadProcessed(page, 'image-to-pdf', 'two-up.pdf', /convert to pdf/i);
    const info = await inspectPdf(dest);
    expect(info.pageCount).toBe(1);
    const pageSize = info.pageSizes[0];
    expect(pageSize).toBeDefined();
    expect(pageSize!.width).toBeGreaterThan(pageSize!.height);
  });

  test('PDF-17 webp reorder', async ({ page }) => {
    await openTool(page, 'image-to-pdf');
    await uploadFiles(page, [fixture.webp, fixture.png]);
    await page.getByRole('button', { name: /move red-800x600\.png earlier/i }).click();
    await page.getByLabel(/pdf page size/i).selectOption('fit');
    const dest = await downloadProcessed(page, 'image-to-pdf', 'order.pdf', /convert to pdf/i);
    const info = await inspectPdf(dest);
    expect(info.pageCount).toBe(2);
    const first = info.pageSizes[0];
    const second = info.pageSizes[1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first!.width).toBeGreaterThan(second!.width);
  });

  test('PDF-19 bad image-to-pdf inputs', async ({ page }) => {
    await openTool(page, 'image-to-pdf');
    await uploadFiles(page, fixture.notesTxt);
    await expect(page.getByText(/not supported/i)).toBeVisible();
  });

  test('PDF-20 reopened PDF has a header', async ({ page }) => {
    await openTool(page, 'pdf-merger');
    await uploadFiles(page, fixture.pdf1);
    const dest = await downloadProcessed(page, 'pdf-merger', 'header.pdf', /merge pdf/i);
    const info = await inspectPdf(dest);
    expect(info.magic).toBe('pdf');
    expect(info.pageCount).toBe(1);
  });
});
