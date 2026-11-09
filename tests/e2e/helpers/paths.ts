import path from 'path';

export const REPO_ROOT = path.resolve(__dirname, '../../..');
export const LOCAL_ROOT = path.join(REPO_ROOT, '.local');
export const FIXTURES = path.join(LOCAL_ROOT, 'testing/fixtures');
export const EVIDENCE = path.join(LOCAL_ROOT, 'testing/evidence');
export const RESULTS = path.join(LOCAL_ROOT, 'testing/results');
export const SCREENSHOTS = path.join(EVIDENCE, 'screenshots');
export const OUTPUTS = path.join(EVIDENCE, 'outputs');
export const GENERATED_FIXTURES = path.join(FIXTURES, 'master');

export const fixture = {
  png: path.join(FIXTURES, 'images/red-800x600.png'),
  jpeg: path.join(FIXTURES, 'images/blue-400x400.jpg'),
  webp: path.join(FIXTURES, 'images/green-200x200.webp'),
  tiny: path.join(FIXTURES, 'images/tiny-1x1.png'),
  transparent: path.join(FIXTURES, 'images/transparent-64x64.png'),
  noisy: path.join(FIXTURES, 'images/noisy-1200x900.jpg'),
  portrait: path.join(FIXTURES, 'images/portrait-600x800.jpg'),
  pdf1: path.join(FIXTURES, 'pdfs/one-page.pdf'),
  pdf2: path.join(FIXTURES, 'pdfs/two-page.pdf'),
  pdf3: path.join(FIXTURES, 'pdfs/three-page.pdf'),
  knownWords: path.join(FIXTURES, 'text/known-words.txt'),
  duplicates: path.join(FIXTURES, 'text/duplicates.txt'),
  validJson: path.join(FIXTURES, 'text/valid.json'),
  invalidJson: path.join(FIXTURES, 'text/invalid.json'),
  empty: path.join(FIXTURES, 'other/empty.bin'),
  corruptPdf: path.join(FIXTURES, 'other/corrupt.pdf'),
  wrongExtPng: path.join(FIXTURES, 'other/wrong-ext.png'),
  notesTxt: path.join(FIXTURES, 'other/notes.txt'),
};
