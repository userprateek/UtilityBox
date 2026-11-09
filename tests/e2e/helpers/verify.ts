import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import jsQR from 'jsqr';
import { OUTPUTS } from './paths';

export function magicOf(buf: Buffer): 'pdf' | 'jpeg' | 'png' | 'webp' | 'unknown' {
  if (buf.length >= 5 && buf.subarray(0, 5).toString('ascii') === '%PDF-') return 'pdf';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return 'png';
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  return 'unknown';
}

export async function inspectImage(filePath: string) {
  const buf = fs.readFileSync(filePath);
  const meta = await sharp(buf).metadata();
  return {
    path: filePath,
    bytes: buf.length,
    magic: magicOf(buf),
    format: meta.format,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    hasAlpha: Boolean(meta.hasAlpha),
  };
}

export async function inspectPdf(filePath: string) {
  const buf = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(buf);
  const pages = pdf.getPages();
  return {
    path: filePath,
    bytes: buf.length,
    magic: magicOf(buf),
    pageCount: pdf.getPageCount(),
    pageSizes: pages.map((p) => {
      const { width, height } = p.getSize();
      return { width, height };
    }),
  };
}

export async function decodeQrPng(filePath: string): Promise<string | null> {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  return code?.data ?? null;
}

export function saveOutput(slug: string, filename: string, buf: Buffer): string {
  const dir = path.join(OUTPUTS, slug);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, filename);
  fs.writeFileSync(dest, buf);
  return dest;
}

export function rfc4122v4(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}

export function emi(principal: number, annualPercent: number, months: number): number {
  const r = annualPercent / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export function sipFv(pmt: number, annualPercent: number, years: number): number {
  const r = annualPercent / 12 / 100;
  const n = years * 12;
  if (r === 0) return pmt * n;
  return pmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

export function fdMaturity(
  principal: number,
  annualPercent: number,
  years: number,
  compoundsPerYear: number
): number {
  const n = compoundsPerYear * years;
  const i = annualPercent / (compoundsPerYear * 100);
  return principal * Math.pow(1 + i, n);
}

export function parseMoney(text: string): number | null {
  const match = text.replace(/\u00a0/g, ' ').match(/₹\s*([\d,]+(?:\.\d+)?)/);
  if (!match?.[1]) return null;
  const n = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}
