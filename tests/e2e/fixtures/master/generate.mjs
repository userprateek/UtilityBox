/**
 * Small fixtures for the master run. Large files are created in the spec, in temp, and are not written here.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../../..');
const out = path.join(repo, '.local/testing/fixtures/master');
fs.mkdirSync(out, { recursive: true });

const noise = Buffer.alloc(900 * 700 * 3);
for (let i = 0; i < noise.length; i += 1) noise[i] = (i * 17) % 256;
await sharp(noise, { raw: { width: 900, height: 700, channels: 3 } })
  .png()
  .toFile(path.join(out, 'large.png'));

await sharp({
  create: { width: 80, height: 60, channels: 3, background: { r: 10, g: 20, b: 30 } },
})
  .jpeg({ quality: 60 })
  .toFile(path.join(out, 'small.jpg'));

fs.writeFileSync(
  path.join(out, 'icon.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32"><rect width="64" height="32" fill="#3366cc"/></svg>'
);

try {
  await sharp({
    create: { width: 32, height: 32, channels: 3, background: { r: 200, g: 20, b: 20 } },
  })
    .gif()
    .toFile(path.join(out, 'sample.gif'));
} catch (error) {
  console.log('gif skipped', error instanceof Error ? error.message : error);
}

try {
  await sharp({
    create: { width: 32, height: 32, channels: 3, background: { r: 20, g: 20, b: 200 } },
  })
    .avif()
    .toFile(path.join(out, 'sample.avif'));
} catch (error) {
  console.log('avif skipped', error instanceof Error ? error.message : error);
}

async function pdfWithLabels(name, labels) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const label of labels) {
    const page = pdf.addPage([400, 300]);
    page.drawText(label, { x: 40, y: 150, size: 18, font, color: rgb(0, 0, 0) });
  }
  fs.writeFileSync(path.join(out, name), Buffer.from(await pdf.save()));
}

await pdfWithLabels(
  'eleven-page.pdf',
  Array.from({ length: 11 }, (_, i) => `PAGE ${i + 1}`)
);

const marked = await PDFDocument.create();
const font = await marked.embedFont(StandardFonts.Helvetica);
const page = marked.addPage([612, 792]);
page.drawRectangle({ x: 48, y: 640, width: 360, height: 40, color: rgb(0.85, 0.1, 0.1) });
page.drawText('The public library opens at nine.', {
  x: 56,
  y: 652,
  size: 16,
  font,
  color: rgb(1, 1, 1),
});
page.drawRectangle({ x: 480, y: 80, width: 80, height: 80, color: rgb(0.1, 0.2, 0.9) });
fs.writeFileSync(path.join(out, 'colored-band.pdf'), Buffer.from(await marked.save()));

const layout = await PDFDocument.create();
const layoutPage = layout.addPage([612, 792]);
layoutPage.drawText('NOTICE', { x: 48, y: 720, size: 28, font, color: rgb(0, 0, 0) });
layoutPage.drawText('Visitors may borrow two books at a time.', {
  x: 48,
  y: 660,
  size: 16,
  font,
  color: rgb(0, 0, 0),
});
layoutPage.drawRectangle({ x: 480, y: 80, width: 80, height: 80, color: rgb(0.1, 0.2, 0.9) });
fs.writeFileSync(path.join(out, 'heading-body.pdf'), Buffer.from(await layout.save()));

const narrow = await PDFDocument.create();
const narrowPage = narrow.addPage([612, 792]);
narrowPage.drawText('Please return every borrowed book within fourteen days today.', {
  x: 48,
  y: 700,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
fs.writeFileSync(path.join(out, 'dense-line.pdf'), Buffer.from(await narrow.save()));

const scannedImage = await sharp({
  create: { width: 900, height: 200, channels: 3, background: { r: 255, g: 255, b: 255 } },
})
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="860" height="160">
          <text x="20" y="70" font-size="28" font-family="sans-serif" fill="#111">The public library opens at nine in the morning.</text>
          <text x="20" y="120" font-size="28" font-family="sans-serif" fill="#111">Visitors may borrow two books at a time.</text>
        </svg>`
      ),
      top: 20,
      left: 20,
    },
  ])
  .jpeg()
  .toBuffer();
fs.writeFileSync(path.join(out, 'notice.jpg'), scannedImage);
const scanned = await PDFDocument.create();
const jpg = await scanned.embedJpg(scannedImage);
const scanPage = scanned.addPage([612, 792]);
scanPage.drawImage(jpg, { x: 36, y: 560, width: 540, height: 120 });
fs.writeFileSync(path.join(out, 'scanned-english.pdf'), Buffer.from(await scanned.save()));

try {
  const plain = await PDFDocument.create();
  plain.addPage([400, 300]);
  const plainPath = path.join(out, 'plain-for-encryption.pdf');
  const lockedPath = path.join(out, 'encrypted.pdf');
  fs.writeFileSync(plainPath, Buffer.from(await plain.save()));
  const { execFileSync } = await import('child_process');
  execFileSync('gs', [
    '-q',
    '-dBATCH',
    '-dNOPAUSE',
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    '-sOwnerPassword=secret',
    '-sUserPassword=secret',
    `-sOutputFile=${lockedPath}`,
    plainPath,
  ]);
  fs.unlinkSync(plainPath);
  const locked = fs.readFileSync(lockedPath);
  if (!locked.includes(Buffer.from('/Encrypt'))) {
    throw new Error('Ghostscript did not encrypt the PDF.');
  }
  console.log('encrypted written');
} catch (error) {
  console.log('encrypt skipped', error instanceof Error ? error.message : error);
}

fs.writeFileSync(path.join(out, 'empty.pdf'), Buffer.alloc(0));
console.log('master fixtures ready', out);
