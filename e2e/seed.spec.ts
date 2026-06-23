import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pom/LoginPage';

const AUTH_FILE = 'e2e/.auth/admin.json';

setup('seed admin session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAsAdmin();

  await expect(page.locator('.oxd-topbar-header-title')).toContainText('Dashboard');

  await page.context().storageState({ path: AUTH_FILE });
});
