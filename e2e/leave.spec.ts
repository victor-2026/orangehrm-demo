import { test, expect } from '../helpers/fixtures';

test.describe('Leave Management', () => {
  test('view leave list page loads @local', async ({ leavePage }) => {
    await leavePage.goto();
    await leavePage.waitForLoadState();

    const isForbidden = await leavePage.isModuleForbidden();
    expect(isForbidden, 'Leave module should not return 403 Forbidden').toBe(false);

    expect(await leavePage.getCurrentUrl()).toContain('/leave/viewLeaveList');
    await expect(leavePage.page.locator('.oxd-topbar-header-breadcrumb-module')).toContainText('Leave');
  });

  test('leave balance displayed @local', async ({ leavePage }) => {
    await leavePage.goto();
    await leavePage.waitForLoadState();

    const isForbidden = await leavePage.isModuleForbidden();
    expect(isForbidden, 'Leave module should not return 403 Forbidden').toBe(false);

    const balanceVisible = await leavePage.page.locator('.oxd-text--subtitle-2, .oxd-label').first().isVisible();
    expect(balanceVisible, 'Leave balance should be displayed').toBe(true);
  });

  test('leave apply page loads @local', async ({ leavePage }) => {
    await leavePage.goto('/web/index.php/leave/applyLeave');
    await leavePage.waitForLoadState();

    const isForbidden = await leavePage.isModuleForbidden();
    expect(isForbidden, 'Leave module should not return 403 Forbidden').toBe(false);

    expect(await leavePage.getCurrentUrl()).toContain('/leave/applyLeave');
    await expect(leavePage.page.locator('.oxd-topbar-header-breadcrumb-module')).toContainText('Leave');
  });

  test('my leave page loads @local', async ({ leavePage }) => {
    await leavePage.gotoMyLeave();
    await leavePage.waitForLoadState();

    const isForbidden = await leavePage.isModuleForbidden();
    expect(isForbidden, 'Leave module should not return 403 Forbidden').toBe(false);

    expect(await leavePage.getCurrentUrl()).toContain('/leave/viewMyLeaveList');
    await expect(leavePage.page.locator('.oxd-topbar-header-breadcrumb-module')).toContainText('Leave');
  });

  // LEAVE-004 requires the leave approval workflow (not auto-approve).
  // OrangeHRM 5.9 auto-approves all leaves → status is "Scheduled",
  // not "Pending Approval", so the admin reject flow can't be tested.
  // TODO: configure approval workflow or use "Cancel" flow on approved leave.
});
