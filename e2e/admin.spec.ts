import { test, expect } from '../helpers/fixtures';

test.describe('Admin — User Management', () => {
  test('can navigate to Admin page @smoke', async ({ adminPage, loggedInPage }) => {
    await adminPage.goto();
    expect(await adminPage.getRecordCount()).toBeGreaterThan(0);
  });

  test('can add a new user @local', async ({ adminPage, page, loggedInPage }) => {
    await adminPage.goto();
    await adminPage.clickAdd();
    expect(page.url()).toContain('/admin/saveSystemUser');
    await adminPage.fillUserForm('ESS', 'Admin Admin', `TestUser_${Date.now()}`, 'TestPass123!');
    const isInvalid = await page.locator('text=Invalid').isVisible({ timeout: 2000 }).catch(() => false);
    test.skip(isInvalid, 'Employee Name autocomplete not available on fresh instance');
    await adminPage.clickSave();
    await page.waitForURL('**/admin/viewSystemUsers', { timeout: 10000 }).catch(() => {});
    expect(page.url()).toContain('/admin/viewSystemUsers');
  });

  test('can view existing user details @smoke', async ({ adminPage, page, loggedInPage }) => {
    await adminPage.goto();
    const hasData = await page.locator('.oxd-table-body .oxd-table-cell').first().isVisible().catch(() => false);
    test.skip(!hasData, 'No user data rows on shared demo');
    await adminPage.viewFirstUser();
    expect(await adminPage.isUserFormVisible()).toBe(true);
  });

  test('can search for existing user @smoke', async ({ adminPage, page, loggedInPage }) => {
    await adminPage.goto();
    await adminPage.searchUser('Admin');
    await expect(page.locator('.oxd-table-body')).toContainText('Admin');
  });

});
