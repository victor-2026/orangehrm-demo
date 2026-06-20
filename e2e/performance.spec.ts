import { test, expect } from '../helpers/fixtures';

test.describe('Performance', () => {
  test('performance page loads with reviews @smoke', async ({ performancePage, loggedInPage }) => {
    await performancePage.goto();
    expect(await performancePage.getCurrentUrl()).toContain('/performance');
  });
});
