import { PDFDocument } from 'pdf-lib';
import { mergePdfFiles } from './pdfMerger';

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
});
