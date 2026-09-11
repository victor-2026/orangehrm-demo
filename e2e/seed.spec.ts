import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pom/LoginPage';

const AUTH_FILE = 'e2e/.auth/admin.json';

// Render free tier sleeps on idle → first request can take 30-60s (cold start).
// Warm up the target before seeding so login doesn't eat the timeout.
setup('warm up target', async ({ page }) => {
  if (process.env.LOCAL === 'true') return;
  setup.setTimeout(180000);
  const deadline = Date.now() + 150000;
  for (;;) {
    try {
      const res = await page.request.get('/web/index.php/auth/login');
      if (res.status() < 500) return;
    } catch {
      // connection refused / timeout while waking — retry
    }
    if (Date.now() > deadline) throw new Error('Target not warm after 150s');
    await page.waitForTimeout(10000);
  }
});

setup('seed admin session', async ({ page }) => {
  setup.setTimeout(180000); // cold Render free tier is slow
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAsAdmin();

  await expect(page.locator('.oxd-topbar-header-title')).toContainText('Dashboard');

  await page.context().storageState({ path: AUTH_FILE });
});
