import { test, expect } from '../helpers/fixtures';

test.describe('Time', () => {
  test('timesheet page loads @smoke', async ({ timePage, loggedInPage }) => {
    await timePage.goto();
    const heading = await timePage.getHeading();
    expect(heading).toContain('Time');
  });

  test('timesheet view is visible', async ({ timePage, loggedInPage }) => {
    await timePage.goto();
    const heading = await timePage.getHeading();
    expect(heading).toContain('Time');
  });
});
