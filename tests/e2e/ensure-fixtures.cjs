/**
 * Jest global setup. Fresh checkouts do not contain fixture bytes.
 * Playwright global setup regenerates the same directories before browser tests.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const markers = [
  '.local/testing/fixtures/images/red-800x600.png',
  '.local/testing/fixtures/text/known-words.txt',
  '.local/testing/fixtures/master/notice.jpg',
];

module.exports = function ensureFixtures() {
  const ready = markers.every((rel) => fs.existsSync(path.join(root, rel)));
  if (ready) return;
  execSync('node tests/e2e/fixtures/generate.mjs', { cwd: root, stdio: 'inherit' });
  execSync('node tests/e2e/fixtures/master/generate.mjs', { cwd: root, stdio: 'inherit' });
};
