import { test, expect } from '@playwright/test';
import { openTool } from '../../helpers/app';

function money(text: string): number {
  const match = text.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

test.describe('Master calculator cases', () => {
  test('CALC-01 remove GST', async ({ page }) => {
    await openTool(page, 'gst-calculator');
    await page.getByRole('button', { name: /remove gst/i }).click();
    await page.getByLabel(/amount|bill|price/i).first().fill('1180');
    await page.getByRole('button', { name: '18%', exact: true }).click();
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/1,?000\.00/);
    expect(body).toMatch(/180\.00/);
    expect(body).toMatch(/90\.00/);
  });

  test('CALC-02 28 percent slab', async ({ page }) => {
    await openTool(page, 'gst-calculator');
    await page.getByRole('button', { name: /add gst/i }).click();
    await page.getByLabel(/amount|base|price/i).first().fill('1000');
    await page.getByRole('button', { name: '28%', exact: true }).click();
    await expect(page.getByText(/1,?280\.00/)).toBeVisible();
  });

  test('CALC-03 negative cost is rejected', async ({ page }) => {
    await openTool(page, 'gst-calculator');
    await page.getByLabel(/cost price/i).fill('-5');
    await page.getByLabel(/desired net profit/i).fill('200');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/invalid|cannot be negative|greater than 0|enter a positive/i);
    expect(body).not.toMatch(/₹\s*-\d/);
  });

  test('CALC-04 zero interest EMI', async ({ page }) => {
    await openTool(page, 'emi-calculator');
    await page.getByLabel(/loan amount/i).fill('120000');
    await page.getByLabel(/interest/i).fill('0');
    await page.getByLabel(/tenure/i).fill('12');
    await page.getByRole('button', { name: /^months$/i }).click();
    const body = await page.locator('body').innerText();
    expect(money(body)).toBeCloseTo(10000, 0);
  });

  test('CALC-05 zero tenure is invalid', async ({ page }) => {
    await openTool(page, 'emi-calculator');
    await page.getByLabel(/loan amount/i).fill('100000');
    await page.getByLabel(/interest/i).fill('10');
    await page.getByLabel(/tenure/i).fill('0');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/greater than 0|at least 1|invalid tenure|tenure must/i);
  });

  test('CALC-06 months match years', async ({ page }) => {
    await openTool(page, 'emi-calculator');
    await page.getByLabel(/loan amount/i).fill('100000');
    await page.getByLabel(/interest/i).fill('10.5');
    await page.getByLabel(/tenure/i).fill('5');
    const years = money(await page.locator('body').innerText());
    await page.getByRole('button', { name: /^months$/i }).click();
    await page.getByLabel(/tenure/i).fill('60');
    const months = money(await page.locator('body').innerText());
    expect(Math.abs(years - months)).toBeLessThan(0.05);
  });

  test('CALC-07 gratuity at 5 and 4.9 years', async ({ page }) => {
    await openTool(page, 'gratuity-calculator');
    await page.getByLabel(/basic salary/i).fill('45000');
    await page.getByLabel(/years/i).fill('5');
    await expect(page.getByText(/1,29,807\.69/)).toBeVisible();
    await page.getByLabel(/years/i).fill('4.9');
    await expect(page.getByText(/not eligible/i)).toBeVisible();
    await expect(page.getByText(/₹\s*0\.00/)).toBeVisible();
  });

  test('CALC-08 zero salary and tax flag', async ({ page }) => {
    await openTool(page, 'gratuity-calculator');
    await page.getByLabel(/basic salary/i).fill('0');
    await page.getByLabel(/years/i).fill('10');
    await expect(page.getByText(/₹\s*0\.00/)).toBeVisible();
    await page.getByLabel(/basic salary/i).fill('200000');
    await page.getByLabel(/years/i).fill('20');
    await expect(page.getByText(/23,07,692\.31/)).toBeVisible();
    await expect(page.getByText(/taxable/i)).toBeVisible();
  });

  test('CALC-09 100 percent discount', async ({ page }) => {
    await openTool(page, 'discount-calculator');
    await page.getByLabel(/price|mrp/i).first().fill('2499');
    await page.getByLabel(/discount/i).first().fill('100');
    await expect(page.getByText(/0\.00/).first()).toBeVisible();
  });

  test('CALC-10 fixed discount', async ({ page }) => {
    await openTool(page, 'discount-calculator');
    await page.getByRole('button', { name: /fixed amount/i }).click();
    await page.getByLabel(/price|mrp/i).first().fill('2499');
    await page.getByLabel(/discount|amount/i).first().fill('500');
    await expect(page.getByText(/1,?999\.00/)).toBeVisible();
    await page.getByLabel(/discount|amount/i).first().fill('9999');
    await expect(page.getByText(/₹\s*0\.00/)).toBeVisible();
  });

  test('CALC-11 lumpsum SIP', async ({ page }) => {
    await openTool(page, 'sip-calculator');
    await page.getByRole('button', { name: /lumpsum/i }).click();
    await page.getByLabel(/amount|deposit|investment/i).first().fill('100000');
    await page.getByLabel(/return|rate/i).first().fill('6');
    await page.getByLabel(/tenure|year/i).first().fill('10');
    await expect(page.getByText(/1,79,085/)).toBeVisible();
  });

  test('CALC-12 zero return is valid and zero years is not', async ({ page }) => {
    await openTool(page, 'sip-calculator');
    await page.getByLabel(/return|rate/i).first().fill('0');
    await expect(page.getByText(/12,00,000/)).toBeVisible();
    await page.getByLabel(/return|rate/i).first().fill('6');
    await page.getByLabel(/tenure|year/i).first().fill('0');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/greater than 0|at least 1|invalid|tenure must/i);
  });

  test('CALC-13 annual FD', async ({ page }) => {
    await openTool(page, 'fd-calculator');
    await page.getByLabel(/compounding/i).selectOption('annually');
    await expect(page.getByText(/1,24,230/)).toBeVisible();
  });

  test('CALC-14 monthly and half-yearly FD', async ({ page }) => {
    await openTool(page, 'fd-calculator');
    await page.getByLabel(/compounding/i).selectOption('monthly');
    await expect(page.getByText(/1,25,145/)).toBeVisible();
    await page.getByLabel(/compounding/i).selectOption('half_yearly');
    await expect(page.getByText(/1,24,718/)).toBeVisible();
    await page.getByLabel(/tenure|year/i).first().fill('0');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/greater than 0|at least 1|invalid|tenure must/i);
  });

  test('CALC-16 non-numeric principal', async ({ page }) => {
    await openTool(page, 'emi-calculator');
    await page.getByLabel(/loan amount/i).fill('abc');
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/NaN|Infinity/);
  });
});
