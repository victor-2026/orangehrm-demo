import { defineConfig } from '@playwright/test';

const LOCAL = process.env.LOCAL === 'true';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 2,
  workers: 2,
  reporter: [
    ['html'],
    ['allure-playwright'],
  ],
  use: {
    baseURL: LOCAL ? process.env.BASE_URL || 'http://localhost:8080' : 'https://opensource-demo.orangehrmlive.com',
    headless: true,
    screenshot: 'only-on-failure',
  },
  snapshotDir: './e2e/visual/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{arg}-{projectName}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    },
  },
  projects: [
    {
      name: 'setup',
      testMatch: 'seed.spec.ts',
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
      use: { browserName: 'chromium', storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'auth',
      testMatch: 'auth.spec.ts',
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
      use: { browserName: 'chromium', storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
  ],
});
