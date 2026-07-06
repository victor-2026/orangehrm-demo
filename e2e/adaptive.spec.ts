import { test, expect, getIsDockerEnv, logEnvironmentInfo } from '../helpers/fixtures';

// Dashboard heading is consistent across all environments in 5.9
const expectedHeading = 'Dashboard';

test.describe('Adaptive @smoke — work on both Docker and Demo', () => {

  test('ADAPT-001: Dashboard page loads @smoke', async ({ dashboardPage, page }) => {
    await logEnvironmentInfo();
    await dashboardPage.goto();
    const heading = await dashboardPage.getHeading();

    expect(heading).toContain(expectedHeading);
    expect(await dashboardPage.isQuickLaunchVisible()).toBe(true);
  });

  test('ADAPT-002: Admin navigation works @smoke', async ({ adminPage, page }) => {
    await adminPage.goto();
    const url = page.url();

    expect(url).toContain('/admin/viewSystemUsers');
    expect(page.locator('.oxd-topbar-header-title')).toContainText('Admin');
    expect(page.locator('.oxd-table')).toBeVisible();
  });

  test('ADAPT-003: Admin search returns results @smoke', async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.searchUser('Admin');
    await adminPage.waitForLoad('.oxd-table-body .oxd-table-row', 10000);

    if (getIsDockerEnv()) {
      expect(page.locator('.oxd-table-body')).toContainText('Admin');
    } else {
      const rows = page.locator('.oxd-table-body .oxd-table-row');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('ADAPT-004: PIM employee list loads @smoke', async ({ pimPage, page }) => {
    await pimPage.goto();

    await page.waitForSelector('.oxd-table', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('ADAPT-005: Leave page loads @smoke', async ({ leavePage, page }) => {
    await leavePage.goto();
    await page.waitForSelector('.oxd-form, .oxd-table', { timeout: 15000 }).catch(() => {});

    const heading = await leavePage.getHeading();
    expect(heading).toContain('Leave');
    expect(await leavePage.isTableVisible()).toBe(true);
  });

  test('ADAPT-006: MyInfo personal details loads @smoke', async ({ myInfoPage, page }) => {
    await myInfoPage.goto();
    await page.waitForSelector('input[name="firstName"]', { timeout: 30000 }).catch(() => {});

    expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 15000 });
    expect(page.locator('input[name="lastName"]')).toBeVisible({ timeout: 15000 });
  });
});