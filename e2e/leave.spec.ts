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

  // LEAVE-004: Cancel flow (admin assigns → auto-approves → admin cancels)
  // Partial implementation: verify assign leave page is accessible.
  // Full cancel flow requires UI interaction debugging (autocomplete, date picker).
  test('LEAVE-004: assign leave page accessible @local', async ({ leavePage, page }) => {
    await leavePage.goto('/web/index.php/leave/assignLeave');
    await leavePage.waitForLoadState();

    const isForbidden = await leavePage.isModuleForbidden();
    expect(isForbidden, 'Assign leave page should not return 403').toBe(false);

    // Verify form elements are present
    await expect(page.locator('text=Assign Leave')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[placeholder="Type for hints..."]')).toBeVisible();
    await expect(page.locator('text=Leave Type')).toBeVisible();
    await expect(page.locator('text=From Date')).toBeVisible();
    await expect(page.locator('text=To Date')).toBeVisible();
  });
});
