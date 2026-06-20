import { test, expect } from '../helpers/fixtures';
import { CREDENTIALS } from '../helpers/credentials';

test.describe('Authentication', () => {
  test('login with valid Admin credentials @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAsAdmin();
    expect(await loginPage.getCurrentUrl()).toContain('/dashboard');
  });

  test('login with invalid password shows error', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.fillUsername(CREDENTIALS.admin.username);
    await loginPage.fillPassword('wrongpassword');
    await loginPage.clickLogin();
    await page.waitForSelector('.oxd-alert-content-text', { timeout: 5000 });
    expect(await loginPage.isLoginErrorVisible()).toBe(true);
    expect(await loginPage.getErrorMessage()).toContain('Invalid');
  });

  test('login with empty credentials stays on login page', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.clickLogin();
    expect(await loginPage.getCurrentUrl()).toContain('/auth/login');
  });

  test('dashboard accessible after login @smoke', async ({ loginPage, dashboardPage }) => {
    await loginPage.goto();
    await loginPage.loginAsAdmin();
    await dashboardPage.goto();
    expect(await dashboardPage.getHeading()).toContain('Dashboard');
    expect(await dashboardPage.isQuickLaunchVisible()).toBe(true);
  });
});
