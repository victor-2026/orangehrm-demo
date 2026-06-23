import { test, expect } from '../helpers/fixtures';

test.describe('Dashboard', () => {
  test('quick launch widgets visible @smoke', async ({ dashboardPage, loggedInPage }) => {
    await dashboardPage.goto();
    expect(await dashboardPage.isQuickLaunchVisible()).toBe(true);
  });

  test('widget count > 0 @smoke', async ({ dashboardPage, loggedInPage }) => {
    await dashboardPage.goto();
    expect(await dashboardPage.getWidgetCount()).toBeGreaterThan(0);
  });

  test('navigate to Admin from Dashboard @smoke', async ({ dashboardPage, loggedInPage }) => {
    await dashboardPage.goto();
    await dashboardPage.navigateTo('Admin');
    const heading = await dashboardPage.getHeading();
    expect(heading).toContain('Admin');
  });

  test('dashboard page loads @local', async ({ dashboardPage, loggedInPage }) => {
    await dashboardPage.goto();
    const heading = await dashboardPage.getHeading();
    expect(heading).toContain('Dashboard');
  });

  test('dashboard widgets visible @local', async ({ dashboardPage, loggedInPage }) => {
    await dashboardPage.goto();
    expect(await dashboardPage.isQuickLaunchVisible()).toBe(true);
  });

  test('dashboard widget count > 0 @local', async ({ dashboardPage, loggedInPage }) => {
    await dashboardPage.goto();
    expect(await dashboardPage.getWidgetCount()).toBeGreaterThan(0);
  });

  test('navigate to Admin from Dashboard @local', async ({ dashboardPage, loggedInPage }) => {
    await dashboardPage.goto();
    await dashboardPage.navigateTo('Admin');
    const heading = await dashboardPage.getHeading();
    expect(heading).toContain('Admin');
  });
});
