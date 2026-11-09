import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFObject,
  PDFPage,
  PDFRef,
  PDFString,
} from 'pdf-lib';

export interface OutlineEntry {
  title: string;
  pageIndex: number;
}

function lookup(doc: PDFDocument, value: PDFObject | undefined): PDFObject | undefined {
  if (!value) return undefined;
  return value instanceof PDFRef ? doc.context.lookup(value) : value;
}

function asDict(doc: PDFDocument, value: PDFObject | undefined): PDFDict | undefined {
  const resolved = lookup(doc, value);
  return resolved instanceof PDFDict ? resolved : undefined;
}

function titleOf(doc: PDFDocument, item: PDFDict): string {
  const value = lookup(doc, item.get(PDFName.of('Title')));
  if (value instanceof PDFString || value instanceof PDFHexString) return value.decodeText();
  return '';
}

function pageIndexFromDest(doc: PDFDocument, dest: PDFObject | undefined): number {
  const resolved = lookup(doc, dest);
  let array: PDFArray | undefined;
  if (resolved instanceof PDFArray) {
    array = resolved;
  } else if (resolved instanceof PDFDict) {
    const actionDest = lookup(doc, resolved.get(PDFName.of('D')));
    if (actionDest instanceof PDFArray) array = actionDest;
  }
  if (!array) return -1;
  const pageRef = array.get(0);
  if (!(pageRef instanceof PDFRef)) return -1;
  return doc.getPages().findIndex((page) => page.ref === pageRef);
}

function walk(
  doc: PDFDocument,
  ref: PDFObject | undefined,
  entries: OutlineEntry[],
  seen: Set<string>
) {
  if (!(ref instanceof PDFRef) || seen.has(ref.tag)) return;
  seen.add(ref.tag);
  const item = asDict(doc, ref);
  if (!item) return;
  const title = titleOf(doc, item).trim();
  const pageIndex = pageIndexFromDest(doc, item.get(PDFName.of('Dest')) ?? item.get(PDFName.of('A')));
  if (title && pageIndex >= 0) entries.push({ title, pageIndex });
  walk(doc, item.get(PDFName.of('First')), entries, seen);
  walk(doc, item.get(PDFName.of('Next')), entries, seen);
}

export function readOutlineEntries(doc: PDFDocument): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  const outlines = asDict(doc, doc.catalog.get(PDFName.of('Outlines')));
  if (!outlines) return entries;
  walk(doc, outlines.get(PDFName.of('First')), entries, new Set());
  return entries;
}

export function writeOutlineEntries(doc: PDFDocument, entries: OutlineEntry[]) {
  const pages = doc.getPages();
  const valid = entries.filter((entry) => entry.title.trim() && pages[entry.pageIndex]);
  if (valid.length === 0) return;

  const outlines = doc.context.obj({ Type: 'Outlines', Count: valid.length });
  const outlinesRef = doc.context.register(outlines);
  const itemRefs = valid.map((entry) => {
    const page = pages[entry.pageIndex] as PDFPage;
    const item = doc.context.obj({
      Title: PDFString.of(entry.title),
      Parent: outlinesRef,
      Dest: doc.context.obj([page.ref, PDFName.of('Fit')]),
    });
    return doc.context.register(item);
  });

  itemRefs.forEach((ref, index) => {
    const item = doc.context.lookup(ref);
    if (!(item instanceof PDFDict)) return;
    if (index > 0) item.set(PDFName.of('Prev'), itemRefs[index - 1]!);
    if (index < itemRefs.length - 1) item.set(PDFName.of('Next'), itemRefs[index + 1]!);
  });

  outlines.set(PDFName.of('First'), itemRefs[0]!);
  outlines.set(PDFName.of('Last'), itemRefs[itemRefs.length - 1]!);
  doc.catalog.set(PDFName.of('Outlines'), outlinesRef);
}
