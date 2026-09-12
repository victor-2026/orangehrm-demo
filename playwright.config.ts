import { defineConfig } from '@playwright/test';

const LOCAL = process.env.LOCAL === 'true';

// Self-hosted stable target (Render free + Aiven MySQL). Public demo retired.
export const RENDER_URL = 'https://orangehrm-app.onrender.com';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 2,
  // Free-tier Render wedges under parallel same-session load (PHP session lock
  // + throttled CPU): serial on CI, 2 workers locally.
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html'],
  ],
  use: {
    baseURL: LOCAL ? process.env.BASE_URL || 'http://localhost:8080' : process.env.BASE_URL || RENDER_URL,
    headless: true,
    screenshot: 'only-on-failure',
  },
  snapshotDir: './e2e/visual/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{arg}-{projectName}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.05,
    },
  },
  projects: [
    {
      name: 'setup',
      testMatch: ['seed.spec.ts', 'seed-data.spec.ts'],
    },
    {
      name: 'smoke',
      grep: /@smoke/,
      use: { browserName: 'chromium', storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'chromium',
      grep: LOCAL ? undefined : /^(?!.*@local)/,
      testIgnore: ['visual/**', 'seed.spec.ts', 'rest-api-qa-test.spec.ts'],
      use: { browserName: 'chromium', storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'auth',
      testMatch: ['auth.spec.ts', 'rest-api-qa-test.spec.ts'],
      use: { browserName: 'chromium' },
    },
    ...(LOCAL ? [{
      name: 'local',
      grep: /@local/,
      use: { browserName: 'chromium' as const, storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup'],
    }] : []),
    {
      name: 'visual',
      testMatch: 'visual/**/*.spec.ts',
      use: { browserName: 'chromium', storageState: 'e2e/.auth/admin.json', baseURL: 'http://localhost:8080' },
      dependencies: ['setup'],
    },
  ],
});
