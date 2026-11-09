import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const PORT = Number(process.env.PLAYWRIGHT_PORT || 3101);
const baseURL = `http://127.0.0.1:${PORT}`;
const evidenceDir = process.env.PLAYWRIGHT_EVIDENCE_DIR || '.local/testing/evidence/master-run';
const resultsDir = process.env.PLAYWRIGHT_RESULTS_DIR || '.local/testing/results';

export default defineConfig({
  testDir: './tests/e2e/specs/master',
  testMatch: '**/*.spec.ts',
  globalSetup: './tests/e2e/specs/master/global-setup.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: `${resultsDir}/master-playwright-results.json` }],
    ['html', { outputFolder: `${evidenceDir}/playwright-report`, open: 'never' }],
  ],
  outputDir: `${evidenceDir}/test-results`,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx next start -p ${PORT} -H 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    cwd: path.resolve('.'),
  },
});
