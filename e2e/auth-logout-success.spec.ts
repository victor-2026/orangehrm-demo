import { test, expect } from '../helpers/fixtures';

test.describe('Auth - Logout Success', () => {
  test('@local @smoke should logout successfully after login', async ({ loggedInPage, page }) => {
    // Verify we're logged in by checking dashboard is visible
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    
    // Click on user dropdown (top right corner)
    await page.locator('.oxd-userdropdown-tab').click();
    
    // Click logout option
    await page.locator('.oxd-userdropdown-link:has-text("Logout")').click();
    
    // Verify redirected to login page
    await expect(page).toHaveURL(/.*auth\/login/);
    
    // Verify login form is visible
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('@local @smoke should logout and prevent access to protected pages', async ({ loggedInPage, page }) => {
    // Login first (handled by loggedInPage fixture)
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    
    // Logout
    await page.locator('.oxd-userdropdown-tab').click();
    await page.locator('.oxd-userdropdown-link:has-text("Logout")').click();
    
    // Verify on login page
    await expect(page).toHaveURL(/.*auth\/login/);
    
    // Try to access a protected page (dashboard)
    await page.goto('/web/index.php/dashboard/index');
    
    // Should be redirected back to login
    await expect(page).toHaveURL(/.*auth\/login/);
    
    // Login form should be visible
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10000 });
  });
});