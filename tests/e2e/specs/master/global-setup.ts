import { execSync } from 'child_process';
import path from 'path';

export default function globalSetup() {
  const root = path.resolve(__dirname, '../../../..');
  execSync('node tests/e2e/fixtures/generate.mjs', { cwd: root, stdio: 'inherit' });
  execSync('node tests/e2e/fixtures/master/generate.mjs', { cwd: root, stdio: 'inherit' });
}
