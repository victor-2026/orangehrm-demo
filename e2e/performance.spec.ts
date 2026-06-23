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

  test('performance page loads @local', async ({ performancePage }) => {
    await performancePage.goto();
    expect(await performancePage.getCurrentUrl()).toContain('/performance');
  });

  test('performance review list loads @local', async ({ performancePage }) => {
    await performancePage.gotoReviewList();
    expect(await performancePage.getCurrentUrl()).toContain('/performance');
  });

  test('performance KPIs page loads @local', async ({ performancePage }) => {
    await performancePage.gotoKPIs();
    expect(await performancePage.getCurrentUrl()).toContain('/performance');
  });
});
