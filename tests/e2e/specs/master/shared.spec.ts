import { test, expect } from '@playwright/test';
import { fixture } from '../../helpers/paths';
import { inspectPdf } from '../../helpers/verify';
import { openTool, uploadFiles } from '../../helpers/app';
import { downloadProcessed, dropFile } from './helper';

const routes: Array<[string, RegExp]> = [
  ['/tools/image-compressor', /image compressor/i],
  ['/pdf-compressor', /pdf merger/i],
  ['/image/image-compressor', /image compressor/i],
  ['/pdf/pdf-merger', /pdf merger/i],
  ['/qr/qr-code-generator', /qr code generator/i],
  ['/text/word-counter', /word/i],
  ['/calculators/gst-calculator', /gst/i],
  ['/developer/json-formatter', /json/i],
  ['/converters/image-converter', /image converter/i],
  ['/compress', /image compressor/i],
  ['/merge', /pdf merger/i],
  ['/upi', /upi/i],
  ['/gst', /gst/i],
  ['/base64', /base64/i],
];

test.describe('Master shared cases', () => {
  test('SHR-01 drop a PNG', async ({ page }) => {
    await openTool(page, 'image-compressor');
    await dropFile(page, fixture.png, 'image/png');
    await expect(page.getByText(/red-800x600\.png/i)).toBeVisible();
  });

  test('SHR-02 reorder and duplicate', async ({ page }) => {
    await openTool(page, 'pdf-merger');
    await uploadFiles(page, [fixture.pdf1, fixture.pdf2]);
    await page.getByRole('button', { name: /move two-page\.pdf earlier/i }).click();
    await page.getByRole('button', { name: /remove file two-page\.pdf/i }).click();
    await uploadFiles(page, fixture.pdf2);
    await expect(page.getByText(/two-page\.pdf/i).first()).toBeVisible();
    const dest = await downloadProcessed(page, 'pdf-merger', 'order.pdf', /merge pdf/i);
    expect((await inspectPdf(dest)).pageCount).toBe(3);
  });

  test('SHR-12 confirmed routes', async ({ page }) => {
    for (const [route, heading] of routes) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
    }
  });

  test('SHR-09 mobile compressor has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openTool(page, 'image-compressor');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(8);
  });

  test('SHR-07 calculator labels are reachable', async ({ page }) => {
    await openTool(page, 'gst-calculator');
    const cost = page.getByLabel(/cost price/i);
    await cost.focus();
    await expect(cost).toBeFocused();
  });
});
