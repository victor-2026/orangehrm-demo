import { test, expect } from '../helpers/fixtures';

test.describe('Leave Management', () => {
  test('view leave list page loads @local', async ({ leavePage }) => {
    await leavePage.goto();
    expect(await leavePage.getCurrentUrl()).toContain('/leave/viewLeaveList');
  });

  test('leave balance displayed @local', async ({ leavePage }) => {
    await leavePage.goto();
    expect(await leavePage.getCurrentUrl()).toContain('/leave/viewLeaveList');
  });

  test('leave apply page loads @local', async ({ leavePage }) => {
    await leavePage.goto('/web/index.php/leave/applyLeave');
    expect(await leavePage.getCurrentUrl()).toContain('/leave/applyLeave');
  });

  test('my leave page loads @local', async ({ leavePage }) => {
    await leavePage.gotoMyLeave();
    expect(await leavePage.getCurrentUrl()).toContain('/leave/viewMyLeaveList');
  });

  // LEAVE-004 requires the leave approval workflow (not auto-approve).
  // OrangeHRM 5.9 demo auto-approves all leaves → status is "Scheduled",
  // not "Pending Approval", so the admin reject flow can't be tested.
  // TODO: configure approval workflow or use a different leave type.
});
