import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { mergePdfFiles } from './pdfMerger';
import { readOutlineEntries } from './outlines';

async function blobBytes(blob: Blob): Promise<Uint8Array> {
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
  return new Uint8Array(buffer);
}

async function makeEncryptedPdf(): Promise<File> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ub-lock-'));
  const plainPath = path.join(dir, 'plain.pdf');
  const lockedPath = path.join(dir, 'encrypted.pdf');
  const plain = await PDFDocument.create();
  plain.addPage([200, 200]);
  fs.writeFileSync(plainPath, await plain.save());
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
  return new File([fs.readFileSync(lockedPath)], 'encrypted.pdf', { type: 'application/pdf' });
}

describe('pdfMerger', () => {
  it('merges multiple PDF files into a single unified PDF document', async () => {
    // Create two dummy PDFs using pdf-lib
    const pdf1 = await PDFDocument.create();
    pdf1.addPage([200, 200]);
    const bytes1 = await pdf1.save();

    const pdf2 = await PDFDocument.create();
    pdf2.addPage([200, 200]);
    pdf2.addPage([200, 200]);
    const bytes2 = await pdf2.save();

    const file1 = new File([bytes1 as unknown as BlobPart], 'doc1.pdf', {
      type: 'application/pdf',
    });
    const file2 = new File([bytes2 as unknown as BlobPart], 'doc2.pdf', {
      type: 'application/pdf',
    });

    const result = await mergePdfFiles([file1, file2]);

    expect(result).toBeDefined();
    expect(result.pageCount).toBe(3);
    expect(result.blob).toBeDefined();
    expect(result.filename).toBe('doc1_merged.pdf');
    expect(result.size).toBeGreaterThan(0);
  });

  it('refuses a password-protected PDF instead of merging it', async () => {
    const file = await makeEncryptedPdf();
    await expect(mergePdfFiles([file])).rejects.toThrow(/password-protected/i);
  });

  it('keeps outline entries and shifts them by the pages already merged', async () => {
    const marked = await PDFDocument.create();
    const page = marked.addPage([200, 200]);
    const outlines = marked.context.obj({ Type: 'Outlines', Count: 1 });
    const outlinesRef = marked.context.register(outlines);
    const item = marked.context.obj({
      Title: PDFString.of('Chapter One'),
      Parent: outlinesRef,
      Dest: marked.context.obj([page.ref, PDFName.of('Fit')]),
    });
    const itemRef = marked.context.register(item);
    outlines.set(PDFName.of('First'), itemRef);
    outlines.set(PDFName.of('Last'), itemRef);
    marked.catalog.set(PDFName.of('Outlines'), outlinesRef);
    const markedBytes = await marked.save();

    const plain = await PDFDocument.create();
    plain.addPage([200, 200]);
    const plainBytes = await plain.save();

    const result = await mergePdfFiles([
      new File([plainBytes as unknown as BlobPart], 'plain.pdf', { type: 'application/pdf' }),
      new File([markedBytes as unknown as BlobPart], 'marked.pdf', { type: 'application/pdf' }),
    ]);
    const merged = await PDFDocument.load(await blobBytes(result.blob));
    expect(merged.getPageCount()).toBe(2);
    expect(readOutlineEntries(merged)).toEqual([{ title: 'Chapter One', pageIndex: 1 }]);
  });
});
