import { test, expect } from '../helpers/fixtures';

test.describe('Leave Management', () => {
  test('view leave list page loads @smoke', async ({ page, loginPage, leavePage }) => {
    await loginPage.goto();
    await loginPage.loginAsAdmin();
    await leavePage.goto();
    expect(page.url()).toContain('/leave/viewLeaveList');
  });

  test('leave balance displayed @smoke', async ({ leavePage, loggedInPage }) => {
    await leavePage.goto();
    const heading = await leavePage.getHeading();
    expect(heading).toContain('Leave');
  });

  test('leave apply page loads @local', async ({ leavePage, loggedInPage }) => {
    await leavePage.goto('/web/index.php/leave/applyLeave');
    await leavePage.waitForForm();
    expect(await leavePage.getCurrentUrl()).toContain('/leave/applyLeave');
  });
});
