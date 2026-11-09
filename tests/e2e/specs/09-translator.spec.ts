import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fixture, OUTPUTS } from '../helpers/paths';
import { openTool, saveDownload, screenshot, uploadFiles, waitForDownload } from '../helpers/app';
import {
  buildLiveMultipagePdf,
  errorSummary,
  inspectOutputPdf,
  redactSecrets,
} from '../../live/multipagePdf';

const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());

test.describe('T-05 AI Document Translator', () => {
  test('UI loads with language selectors and Gemini privacy notice', async ({ page }) => {
    await openTool(page, 'document-translator');
    await expect(page.getByRole('heading', { name: 'AI Document Translator', exact: true })).toBeVisible();
    await expect(page.getByLabel(/document language/i)).toBeVisible();
    await expect(page.getByLabel(/translate into/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^translate$/i })).toBeDisabled();
    await expect(page.getByText(/google gemini/i).first()).toBeVisible();
    await screenshot(page, 't05-translator-ui');
  });

  test('rejects an unsupported file type client-side or via API', async ({ page }) => {
    await openTool(page, 'document-translator');
    await uploadFiles(page, fixture.notesTxt);
    const translate = page.getByRole('button', { name: /^translate$/i });
    if (await translate.isEnabled()) {
      await translate.click();
      await expect(page.getByText(/upload a pdf|not supported|could not/i).first()).toBeVisible({
        timeout: 20_000,
      });
    } else {
      await expect(page.getByText(/pdf|jpg|png|webp/i).first()).toBeVisible();
    }
  });

  test('live Gemini Hindi translation of a multi-page PDF', async ({ page }) => {
    test.skip(!hasGeminiKey, 'GEMINI_API_KEY is not set — live AI integration BLOCKED');
    test.setTimeout(240_000);

    const source = path.join(OUTPUTS, 'document-translator', 'source-multipage.pdf');
    fs.mkdirSync(path.dirname(source), { recursive: true });
    fs.writeFileSync(source, await buildLiveMultipagePdf());

    const apiSummary: {
      httpStatus?: number;
      strategy?: unknown;
      pageCount?: unknown;
      mimeType?: unknown;
      error?: string | null;
      attempts?: unknown;
      captureError?: string;
    } = {};
    let markApi: () => void = () => undefined;
    const apiCaptured = new Promise<void>((resolve) => {
      markApi = resolve;
    });
    page.on('response', (response) => {
      if (!response.url().includes('/api/translate-document')) return;
      void (async () => {
        try {
          const body = await response.text();
          const events = body
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => JSON.parse(line) as Record<string, unknown>);
          const done = events.find((event) => event.type === 'done');
          const failure = events.find((event) => event.type === 'error');
          Object.assign(apiSummary, {
            httpStatus: response.status(),
            strategy: done?.strategy ?? null,
            pageCount: done?.pageCount ?? null,
            mimeType: done?.mimeType ?? null,
            error: failure
              ? redactSecrets(String(failure.message || failure.code || 'translation error'))
              : null,
            attempts: failure?.attempts ?? null,
          });
        } catch (error) {
          apiSummary.captureError = errorSummary(error);
        } finally {
          markApi();
        }
      })();
    });

    await openTool(page, 'document-translator');
    await uploadFiles(page, source);
    await page.getByLabel(/document language/i).selectOption('en');
    await page.getByLabel(/translate into/i).selectOption('hi');
    await page.getByRole('button', { name: /^translate$/i }).click();
    await expect(page.getByRole('button', { name: /download translated file/i })).toBeEnabled({
      timeout: 180_000,
    });
    const dest = path.join(OUTPUTS, 'document-translator', 'ui-hindi.pdf');
    const download = await waitForDownload(page, () =>
      page.getByRole('button', { name: /download translated file/i }).click()
    );
    await saveDownload(download, dest);
    const info = await inspectOutputPdf(fs.readFileSync(dest));
    await apiCaptured;
    fs.writeFileSync(
      path.join(OUTPUTS, 'document-translator', 'ui-live.json'),
      JSON.stringify({ api: apiSummary, pdf: info }, null, 2)
    );
    expect(info.opened).toBe(true);
    expect(info.pageCount).toBe(2);
    expect(info.devanagari).toBe(true);
    expect(info.englishMarkers).toEqual([]);
    expect(apiSummary.strategy).toBeTruthy();
    await screenshot(page, 't05-translator-live-success');
  });

  test('missing-key or infrastructure error is shown when Translate is used', async ({ page }) => {
    test.skip(hasGeminiKey, 'Live key present — infrastructure failure path not applicable');
    await openTool(page, 'document-translator');
    await uploadFiles(page, fixture.pdf1);
    await page.getByRole('button', { name: /^translate$/i }).click();
    await expect(
      page.getByText(/unavailable|not configured|could not|failed|provider/i).first()
    ).toBeVisible({ timeout: 30_000 });
    await screenshot(page, 't05-translator-no-key');
  });
});
