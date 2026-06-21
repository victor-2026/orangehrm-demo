import { test, expect } from '../helpers/fixtures';

test.describe('Leave Management', () => {
  test('view leave list page loads @smoke', async ({ leavePage }) => {
    await leavePage.goto();
    expect(await leavePage.getCurrentUrl()).toContain('/leave/viewLeaveList');
  });

  test('leave balance displayed @smoke', async ({ leavePage }) => {
    await leavePage.goto();
    expect(await leavePage.getCurrentUrl()).toContain('/leave/viewLeaveList');
  });

  test('leave apply page loads @local', async ({ leavePage }) => {
    await leavePage.goto('/web/index.php/leave/applyLeave');
    expect(await leavePage.getCurrentUrl()).toContain('/leave/applyLeave');
  });

  test('my leave page loads @smoke', async ({ leavePage }) => {
    await leavePage.gotoMyLeave();
    expect(await leavePage.getCurrentUrl()).toContain('/leave/viewMyLeaveList');
  });
});
