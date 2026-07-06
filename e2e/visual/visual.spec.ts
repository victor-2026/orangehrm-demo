import { test, expect } from '../../helpers/fixtures';

test.describe('Visual Regression — Login (no auth)', () => {
  test.use({ storageState: {} });

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('1 — login page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('login.png', { fullPage: true });
  });

  test('2 — login page (filled)', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.fillUsername('Admin');
    await loginPage.fillPassword('admin123');
    await expect(page).toHaveScreenshot('login-filled.png', { fullPage: true });
  });
});

test.describe('Visual Regression — OrangeHRM', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('3 — dashboard', async ({ page, loggedInPage, dashboardPage }) => {
    await dashboardPage.goto();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true });
  });

  test('4 — admin user table', async ({ page, loggedInPage, adminPage }) => {
    await adminPage.goto();
    await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
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

  test('7 — leave list', async ({ page, loggedInPage, leavePage }) => {
    await leavePage.goto();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('leave-list.png', { fullPage: true });
  });

  test('8 — my leave', async ({ page, loggedInPage, leavePage }) => {
    await leavePage.gotoMyLeave();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('my-leave.png', { fullPage: true });
  });

  test('9 — recruitment candidates', async ({ page, loggedInPage, recruitmentPage }) => {
    await recruitmentPage.goto();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('recruitment-candidates.png', { fullPage: true });
  });

  test('10 — recruitment vacancies', async ({ page, loggedInPage, recruitmentPage }) => {
    await recruitmentPage.gotoVacancies();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('recruitment-vacancies.png', { fullPage: true });
  });

  test('11 — performance review list', async ({ page, loggedInPage, performancePage }) => {
    await performancePage.gotoReviewList();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/performance/, { timeout: 10000 });
    await expect(page).toHaveScreenshot('performance-reviews.png', { fullPage: true });
  });

  test('12 — performance KPIs', async ({ page, loggedInPage, performancePage }) => {
    await performancePage.gotoKPIs();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/performance/, { timeout: 10000 });
    await expect(page).toHaveScreenshot('performance-kpis.png', { fullPage: true });
  });

  test('13 — buzz feed', async ({ page, loggedInPage, buzzPage }) => {
    await buzzPage.goto();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('buzz-feed.png', { fullPage: true });
  });

  test('14 — buzz create post', async ({ page, loggedInPage, buzzPage }) => {
    await buzzPage.goto();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    const input = page.locator('.oxd-buzz-post-input, textarea[placeholder*="What"], [contenteditable="true"]').first();
    await input.waitFor({ state: 'visible', timeout: 15000 });
    await expect(page).toHaveScreenshot('buzz-create-post.png', { fullPage: true });
  });

  test('15 — my info personal details', async ({ page, loggedInPage, myInfoPage }) => {
    await myInfoPage.goto();
    await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 30000 });
    await expect(page).toHaveScreenshot('myinfo-personal.png', { fullPage: true });
  });

  test('16 — my info contact details', async ({ page, loggedInPage, myInfoPage }) => {
    await myInfoPage.goto();
    await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 30000 });
    await myInfoPage.clickSubTab('Contact Details');
    await expect(page).toHaveScreenshot('myinfo-contact.png', { fullPage: true });
  });

  test('17 — time timesheet list', async ({ page, loggedInPage, timePage }) => {
    await timePage.goto();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('time-timesheets.png', { fullPage: true });
  });

  test('18 — time my timesheet', async ({ page, loggedInPage, timePage }) => {
    await timePage.gotoMyTimesheet();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/time/, { timeout: 10000 });
    await expect(page).toHaveScreenshot('time-my-timesheet.png', { fullPage: true });
  });

  test('19 — claim assign claim', async ({ page, loggedInPage, claimPage }) => {
    await claimPage.goto();
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('claim-assign.png', { fullPage: true });
  });

  test('20 — claim my claims', async ({ page, loggedInPage, claimPage }) => {
    await claimPage.gotoMyClaims();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/claim/, { timeout: 10000 });
    await expect(page).toHaveScreenshot('claim-my-claims.png', { fullPage: true });
  });

  test('21 — maintenance password screen', async ({ page, loggedInPage, maintenancePage }) => {
    await maintenancePage.goto();
    await expect(page.locator('h6:has-text("Administrator Access")')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('maintenance-password.png', { fullPage: true });
  });

  test('22 — maintenance purge records', async ({ page, loggedInPage, maintenancePage }) => {
    await maintenancePage.goto();
    await expect(page.locator('h6:has-text("Administrator Access")')).toBeVisible({ timeout: 10000 });
    await maintenancePage.enterPassword('Orangehrm@2026');
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveScreenshot('maintenance-purge.png', { fullPage: true });
  });
});
