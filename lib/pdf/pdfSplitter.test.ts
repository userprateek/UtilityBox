import { PDFDocument } from 'pdf-lib';
import { splitPdfDocument, parsePageRangeString, getPdfPageCount } from './pdfSplitter';

describe('pdfSplitter', () => {
  it('parses page range strings into 0-indexed page numbers', () => {
    expect(parsePageRangeString('1-3, 5', 10)).toEqual([0, 1, 2, 4]);
    expect(parsePageRangeString('2-4', 5)).toEqual([1, 2, 3]);
    expect(parsePageRangeString('', 3)).toEqual([0, 1, 2]);
  });

  it('splits a 3-page PDF into 1 page per file in all_pages mode', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([200, 200]);
    pdfDoc.addPage([200, 200]);
    pdfDoc.addPage([200, 200]);
    const bytes = await pdfDoc.save();

    const file = new File([bytes as unknown as BlobPart], 'multipage.pdf', { type: 'application/pdf' });

    const pageCount = await getPdfPageCount(file);
    expect(pageCount).toBe(3);

    const splitResults = await splitPdfDocument(file, { mode: 'all_pages' });
    expect(splitResults).toHaveLength(3);
    expect(splitResults[0]?.filename).toBe('multipage_page_1.pdf');
    expect(splitResults[1]?.filename).toBe('multipage_page_2.pdf');
    expect(splitResults[2]?.filename).toBe('multipage_page_3.pdf');
  });

  it('extracts a custom page range (e.g. pages 1 and 3)', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([200, 200]);
    pdfDoc.addPage([200, 200]);
    pdfDoc.addPage([200, 200]);
    const bytes = await pdfDoc.save();

    const file = new File([bytes as unknown as BlobPart], 'report.pdf', { type: 'application/pdf' });

    const splitResults = await splitPdfDocument(file, { mode: 'range', pageRange: '1, 3' });
    expect(splitResults).toHaveLength(1);
    expect(splitResults[0]?.pageCount).toBe(2);
    expect(splitResults[0]?.filename).toContain('pages_1__3');
  });
});
