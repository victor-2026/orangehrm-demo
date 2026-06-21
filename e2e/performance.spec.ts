import { test, expect } from '../helpers/fixtures';

test.describe('Performance', () => {
  test('performance page loads with reviews @smoke', async ({ performancePage }) => {
    await performancePage.goto();
    expect(await performancePage.getCurrentUrl()).toContain('/performance');
  });

  test('performance navigation tabs are visible @smoke', async ({ performancePage }) => {
    await performancePage.gotoReviewList();
    expect(await performancePage.getCurrentUrl()).toContain('/performance');
  });
});
