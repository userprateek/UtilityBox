import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
  const script = path.join(__dirname, 'fixtures/generate.mjs');
  execSync(`node ${script}`, { stdio: 'inherit' });
}
