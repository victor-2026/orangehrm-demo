import { test, expect } from '../helpers/fixtures';

test.describe('OrangeHRM Auth Tests (with skill)', () => {
  test('valid credentials login successfully with proper timeout', async ({ page, loginPage }) => {
    // Skill pattern: explicit timeout
    await loginPage.goto();
    await loginPage.loginAsAdmin();
    
    // Skill pattern: verify with explicit timeout (like API timeout)
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 15000 });
    
    // Skill pattern: token/session validation
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
  });

  test('invalid password shows error message with proper assertions', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.fillUsername('Admin');
    await loginPage.fillPassword('wrongpassword');
    await loginPage.clickLogin();
    
    // Skill pattern: validate error message content, not just existence
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg).toContain('Invalid');
    
    // Skill pattern: verify still on login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});