import { test, expect } from '@playwright/test';
import { emi, fdMaturity, parseMoney, sipFv } from '../helpers/verify';
import { openTool, screenshot } from '../helpers/app';

function nearby(actual: number | null, expected: number, tol = 1) {
  expect(actual, `expected ~${expected}, got ${actual}`).not.toBeNull();
  expect(Math.abs((actual as number) - expected)).toBeLessThanOrEqual(tol);
}

test.describe('T-19 GST Calculator', () => {
  test('shopkeeper mode: cost 1000 profit 200 @18% = MRP 1416', async ({ page }) => {
    await openTool(page, 'gst-calculator');
    await page.getByLabel(/cost/i).fill('1000');
    await page.getByLabel(/desired net profit/i).fill('200');
    await expect(page.getByText('₹1,416.00')).toBeVisible();
    await screenshot(page, 't19-gst-shopkeeper');
  });

  test('add GST exclusive: 500 @18% = 590', async ({ page }) => {
    await openTool(page, 'gst-calculator');
    await page.getByRole('button', { name: /add gst/i }).click();
    await page.getByLabel(/base amount/i).fill('500');
    await expect(page.getByText('₹590.00')).toBeVisible();
  });
});

test.describe('T-20 EMI Calculator', () => {
  test('EMI for 100000 at 10.5% over 5 years matches formula', async ({ page }) => {
    const expected = emi(100000, 10.5, 60);
    await openTool(page, 'emi-calculator');
    await page.getByLabel(/loan amount/i).fill('100000');
    await page.getByLabel(/interest rate/i).fill('10.5');
    await page.getByLabel(/loan tenure/i).fill('5');
    const emiBlock = page.locator('div').filter({ hasText: /MONTHLY EMI PAYABLE/i }).first();
    const parsed = parseMoney(await emiBlock.innerText());
    nearby(parsed, expected, 1);
    expect(expected).toBeGreaterThan(2000);
    await screenshot(page, 't20-emi');
  });
});

test.describe('T-21 Gratuity Calculator', () => {
  test('7 years at 45000 matches (15*basic*years)/26', async ({ page }) => {
    const expected = (15 * 45000 * 7) / 26;
    await openTool(page, 'gratuity-calculator');
    await page.getByLabel(/basic salary/i).fill('45000');
    await page.getByLabel(/years/i).fill('7');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/1,81,730|181,730|181730/);
    nearby(expected, 181730.77, 0.01);
    await screenshot(page, 't21-gratuity');
  });

  test('under 5 years is not eligible', async ({ page }) => {
    await openTool(page, 'gratuity-calculator');
    await page.getByLabel(/years/i).fill('4');
    await expect(page.getByText(/not eligible/i)).toBeVisible();
  });
});

test.describe('T-22 Discount Calculator', () => {
  test('2499 at 25% off = 1874.25', async ({ page }) => {
    await openTool(page, 'discount-calculator');
    await page.getByRole('spinbutton', { name: /original|mrp|price/i }).fill('2499');
    await page.getByRole('spinbutton', { name: /discount percentage/i }).fill('25');
    await expect(page.getByText(/1,874\.25|1874\.25/)).toBeVisible();
    await screenshot(page, 't22-discount');
  });
});

test.describe('T-23 SIP Calculator', () => {
  test('default 10000/mo 6% 10y matches future-value formula', async ({ page }) => {
    const expected = Math.round(sipFv(10000, 6, 10));
    await openTool(page, 'sip-calculator');
    const body = await page.locator('body').innerText();
    const match = body.match(/₹[\d,]+/g) || [];
    const values = match.map((m) => parseMoney(m)).filter((n): n is number => n !== null);
    expect(values.some((v) => Math.abs(v - expected) <= 2), `expected ${expected} in ${values.join(',')}`).toBe(
      true
    );
    await screenshot(page, 't23-sip');
  });
});

test.describe('T-24 FD Calculator', () => {
  test('100000 at 7.5% quarterly 3 years matches compound formula', async ({ page }) => {
    const expected = Math.round(fdMaturity(100000, 7.5, 3, 4));
    await openTool(page, 'fd-calculator');
    const body = await page.locator('body').innerText();
    const match = body.match(/₹[\d,]+/g) || [];
    const values = match.map((m) => parseMoney(m)).filter((n): n is number => n !== null);
    expect(values.some((v) => Math.abs(v - expected) <= 2), `expected ${expected} in ${values.join(',')}`).toBe(
      true
    );
    await screenshot(page, 't24-fd');
  });
});
