/**
 * @jest-environment node
 */
import { PDFDocument } from 'pdf-lib';
import { unzipStored, zipStored } from './zipStore';

describe('zipStored', () => {
  it('round-trips several PDF entries without compression', async () => {
    const files = await Promise.all(
      ['one', 'two', 'three'].map(async (label) => {
        const pdf = await PDFDocument.create();
        pdf.addPage([200, 200]);
        return { name: `${label}.pdf`, bytes: await pdf.save() };
      })
    );
    const archive = zipStored(files);
    expect(Buffer.from(archive.subarray(0, 2)).toString()).toBe('PK');
    const restored = unzipStored(archive);
    expect(restored.map((entry) => entry.name)).toEqual(['one.pdf', 'two.pdf', 'three.pdf']);
    for (const entry of restored) {
      const pdf = await PDFDocument.load(entry.bytes);
      expect(pdf.getPageCount()).toBe(1);
    }
  });
});
