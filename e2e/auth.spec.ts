import { test, expect } from '../helpers/fixtures';
import { CREDENTIALS } from '../helpers/credentials';

test.describe('Authentication', () => {
  test('login with valid Admin credentials @local', async ({ page, loginPage }) => {
    await page.goto('/web/index.php/auth/logout').catch(() => {});
    await page.goto('/web/index.php/auth/login');
    await loginPage.loginAsAdmin();
    expect(await loginPage.getCurrentUrl()).toContain('/dashboard');
  });

  test('login with invalid password shows error @local', async ({ page, loginPage }) => {
    await page.goto('/web/index.php/auth/logout').catch(() => {});
    await page.goto('/web/index.php/auth/login');
    await loginPage.fillUsername(CREDENTIALS.admin.username);
    await loginPage.fillPassword('wrongpassword');
    await loginPage.clickLogin();
    await page.waitForSelector('.oxd-alert-content-text', { timeout: 5000 });
    expect(await loginPage.isLoginErrorVisible()).toBe(true);
    expect(await loginPage.getErrorMessage()).toContain('Invalid');
  });

  test('login with empty credentials stays on login page @local', async ({ page, loginPage }) => {
    await page.goto('/web/index.php/auth/logout').catch(() => {});
    await page.goto('/web/index.php/auth/login');
    await loginPage.clickLogin();
    expect(await loginPage.getCurrentUrl()).toContain('/auth/login');
  });

  test('dashboard accessible after login @local', async ({ page, loginPage, dashboardPage }) => {
    await page.goto('/web/index.php/auth/logout').catch(() => {});
    await page.goto('/web/index.php/auth/login');
    await loginPage.loginAsAdmin();
    await dashboardPage.goto();
    expect(await dashboardPage.getHeading()).toContain('Dashboard');
    expect(await dashboardPage.isQuickLaunchVisible()).toBe(true);
  });
});
