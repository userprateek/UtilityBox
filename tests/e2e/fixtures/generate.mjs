/**
 * Generates small deterministic fixtures for Playwright functional tests.
 * Uses existing app dependencies only (sharp, pdf-lib).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../..');
const dest = path.join(repo, '.local/testing/fixtures');
const images = path.join(dest, 'images');
const pdfs = path.join(dest, 'pdfs');
const text = path.join(dest, 'text');
const other = path.join(dest, 'other');

for (const dir of [images, pdfs, text, other]) {
  fs.mkdirSync(dir, { recursive: true });
}

async function writePdf(filename, pages) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const label of pages) {
    const page = pdf.addPage([400, 300]);
    page.drawText(label, { x: 40, y: 160, size: 24, font, color: rgb(0, 0, 0) });
  }
  fs.writeFileSync(path.join(pdfs, filename), Buffer.from(await pdf.save()));
}

await sharp({
  create: { width: 800, height: 600, channels: 3, background: { r: 220, g: 40, b: 40 } },
})
  .png()
  .toFile(path.join(images, 'red-800x600.png'));

await sharp({
  create: { width: 400, height: 400, channels: 3, background: { r: 30, g: 90, b: 200 } },
})
  .jpeg({ quality: 85 })
  .toFile(path.join(images, 'blue-400x400.jpg'));

await sharp({
  create: { width: 200, height: 200, channels: 3, background: { r: 20, g: 160, b: 70 } },
})
  .webp({ quality: 80 })
  .toFile(path.join(images, 'green-200x200.webp'));

await sharp({
  create: { width: 1, height: 1, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .png()
  .toFile(path.join(images, 'tiny-1x1.png'));

await sharp({
  create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 255, b: 0, alpha: 0.4 } },
})
  .png()
  .toFile(path.join(images, 'transparent-64x64.png'));

// Noisy JPEG large enough to make 50KB / 100KB targets meaningful.
const noise = Buffer.alloc(1200 * 900 * 3);
for (let i = 0; i < noise.length; i += 1) {
  noise[i] = (i * 37 + (i % 251)) % 256;
}
await sharp(noise, { raw: { width: 1200, height: 900, channels: 3 } })
  .jpeg({ quality: 95 })
  .toFile(path.join(images, 'noisy-1200x900.jpg'));

await sharp({
  create: { width: 600, height: 800, channels: 3, background: { r: 240, g: 220, b: 200 } },
})
  .jpeg({ quality: 90 })
  .toFile(path.join(images, 'portrait-600x800.jpg'));

await writePdf('one-page.pdf', ['PAGE ONE']);
await writePdf('two-page.pdf', ['PAGE ONE', 'PAGE TWO']);
await writePdf('three-page.pdf', ['PAGE ONE', 'PAGE TWO', 'PAGE THREE']);

fs.writeFileSync(path.join(text, 'known-words.txt'), 'Alpha beta gamma.\n\nDelta delta.');
fs.writeFileSync(path.join(text, 'duplicates.txt'), 'a\nb\na\nc\n');
fs.writeFileSync(path.join(text, 'sample.txt'), 'DocsWala is a 100% free and private suite of client-side browser tools.');
fs.writeFileSync(
  path.join(text, 'valid.json'),
  JSON.stringify({ app: 'DocsWala', ok: true, n: 2 }, null, 2)
);
fs.writeFileSync(path.join(text, 'invalid.json'), '{ "broken": true,');
fs.writeFileSync(path.join(other, 'empty.bin'), Buffer.alloc(0));
fs.writeFileSync(path.join(other, 'corrupt.pdf'), Buffer.from('this is not a pdf file!!!!'));
fs.writeFileSync(path.join(other, 'wrong-ext.png'), Buffer.from('plain text pretending to be png'));
fs.writeFileSync(path.join(other, 'notes.txt'), 'not an image');

const manifest = {
  generatedAt: new Date().toISOString(),
  files: {
    png: 'images/red-800x600.png',
    jpeg: 'images/blue-400x400.jpg',
    webp: 'images/green-200x200.webp',
    tiny: 'images/tiny-1x1.png',
    transparent: 'images/transparent-64x64.png',
    noisy: 'images/noisy-1200x900.jpg',
    portrait: 'images/portrait-600x800.jpg',
    pdf1: 'pdfs/one-page.pdf',
    pdf2: 'pdfs/two-page.pdf',
    pdf3: 'pdfs/three-page.pdf',
  },
};
fs.writeFileSync(path.join(dest, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Fixtures written to', dest);
