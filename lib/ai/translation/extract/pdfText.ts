import { BoundingBox, TextBlockType, TranslateContentInput } from '../types';
import { groupLinesIntoParagraphs, LineFragment } from '../reconstruct/geometry';
import { openPdfDocument } from '../pdfjs';

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

interface Cluster {
  texts: string[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  fontHeight: number;
}

function itemBox(item: TextItem, pageWidth: number, pageHeight: number): BoundingBox {
  const x = item.transform[4] ?? 0;
  const y = item.transform[5] ?? 0;
  const width = item.width || 8;
  const height = item.height || Math.abs(item.transform[3] ?? 10);
  const top = pageHeight - y - height;
  return {
    x: x / pageWidth,
    y: top / pageHeight,
    width: width / pageWidth,
    height: height / pageHeight,
  };
}

function maybeMerge(cluster: Cluster, box: BoundingBox, text: string): boolean {
  const last = cluster.texts[cluster.texts.length - 1] ?? '';
  const clusterMidY = (cluster.minY + cluster.maxY) / 2;
  const boxMidY = box.y + box.height / 2;
  const sameLine = Math.abs(clusterMidY - boxMidY) < Math.max(cluster.maxY - cluster.minY, box.height) * 0.8;
  const horizontalGap = box.x - cluster.maxX;
  const close = horizontalGap >= -0.01 && horizontalGap < 0.08;
  if (sameLine && close) {
    const space = /[\s-]$/.test(last) || /^[\s-]/.test(text) ? '' : ' ';
    cluster.texts.push(space + text);
    cluster.maxX = Math.max(cluster.maxX, box.x + box.width);
    cluster.minY = Math.min(cluster.minY, box.y);
    cluster.maxY = Math.max(cluster.maxY, box.y + box.height);
    return true;
  }
  return false;
}

function guessType(text: string, height: number): TextBlockType {
  if (height > 0.035 && text.length < 80) return 'heading';
  if (/^[\d•\-*]/.test(text) && text.length < 180) return 'list_item';
  if (text.length < 32) return 'label';
  return 'paragraph';
}

export async function extractPdfTextBlocks(buffer: Buffer): Promise<TranslateContentInput['pages']> {
  const pdf = await openPdfDocument(buffer);
  const pages: TranslateContentInput['pages'] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const clusters: Cluster[] = [];

    for (const raw of content.items) {
      if (!('str' in raw)) continue;
      const item = raw as unknown as TextItem;
      const text = item.str.replace(/\s+/g, ' ').trim();
      if (!text) continue;
      const box = itemBox(item, viewport.width, viewport.height);
      const last = clusters[clusters.length - 1];
      if (last && maybeMerge(last, box, text)) continue;
      clusters.push({
        texts: [text],
        minX: box.x,
        minY: box.y,
        maxX: box.x + box.width,
        maxY: box.y + box.height,
        fontHeight: box.height,
      });
    }

    const lines: LineFragment[] = clusters.map((cluster) => ({
      text: cluster.texts.join('').replace(/\s+/g, ' ').trim(),
      x: cluster.minX,
      y: cluster.minY,
      width: Math.max(0.02, cluster.maxX - cluster.minX),
      height: Math.max(0.008, cluster.maxY - cluster.minY),
    }));
    const paragraphs = groupLinesIntoParagraphs(lines, `p${pageNumber}`);

    pages.push({
      pageNumber,
      width: viewport.width,
      height: viewport.height,
      blocks: paragraphs.map((paragraph) => ({
        id: paragraph.id,
        type: guessType(paragraph.text, paragraph.lineHeight),
        originalText: paragraph.text,
        bbox: paragraph.bbox,
      })),
    });
  }

  return pages;
}
