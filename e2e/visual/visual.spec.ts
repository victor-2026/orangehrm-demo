import { test, expect } from '../../helpers/fixtures';

test.describe('Visual Regression — OrangeHRM', () => {

  test('1 — login page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page.locator('.orangehrm-login-branding')).toBeVisible();
    await expect(page).toHaveScreenshot('login.png', { fullPage: true });
  });

  test('2 — login page (filled)', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.fillUsername('Admin');
    await loginPage.fillPassword('admin123');
    await expect(page).toHaveScreenshot('login-filled.png', { fullPage: true });
  });

  test('3 — dashboard', async ({ page, loggedInPage, dashboardPage }) => {
    await dashboardPage.goto();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true });
  });

  test('4 — admin user table', async ({ page, loggedInPage, adminPage }) => {
    await adminPage.goto();
    await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('admin-users.png');
  });

  test('5 — PIM employee list', async ({ page, loggedInPage, pimPage }) => {
    await pimPage.goto();
    await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('pim-employees.png', { fullPage: true });
  });

  test('6 — directory (empty state)', async ({ page, loggedInPage, directoryPage }) => {
    await directoryPage.goto();
    await expect(page).toHaveURL(/\/directory/, { timeout: 10000 });
    await expect(page).toHaveScreenshot('directory.png', { fullPage: true });
  });
});
