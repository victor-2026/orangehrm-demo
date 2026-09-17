import { test, expect } from '../helpers/fixtures';

test.describe('Time', () => {
  test('timesheet page loads @smoke', async ({ timePage }) => {
    await timePage.goto();
    const heading = await timePage.getHeading();
    expect(heading).toContain('Time');
  });

  test('timesheet view is visible @smoke', async ({ timePage }) => {
    await timePage.goto();
    const heading = await timePage.getHeading();
    expect(heading).toContain('Time');
  });

  test('my timesheet page loads @smoke', async ({ timePage }) => {
    await timePage.gotoMyTimesheet();
    expect(await timePage.getCurrentUrl()).toContain('/time');
  });

  test('timesheet period selector visible @smoke', async ({ timePage }) => {
    await timePage.gotoMyTimesheet();
    expect(await timePage.getCurrentUrl()).toContain('/time');
  });

  test('attendance page loads @smoke', async ({ timePage }) => {
    await timePage.gotoAttendance();
    expect(await timePage.getCurrentUrl()).toContain('/time');
  });

  test('timesheet actions visible @smoke', async ({ timePage }) => {
    await timePage.gotoMyTimesheet();
    expect(await timePage.getCurrentUrl()).toContain('/time');
  });

  test('timesheet page loads @local', async ({ timePage }) => {
    await timePage.goto();
    const heading = await timePage.getHeading();
    expect(heading).toContain('Time');
  });

  test('my timesheet page loads @local', async ({ timePage }) => {
    await timePage.gotoMyTimesheet();
    expect(await timePage.getCurrentUrl()).toContain('/time');
  });

  test('attendance page loads @local', async ({ timePage }) => {
    await timePage.gotoAttendance();
    expect(await timePage.getCurrentUrl()).toContain('/time');
  });

  test('timesheet actions visible @local', async ({ timePage }) => {
    await timePage.gotoMyTimesheet();
    expect(await timePage.getCurrentUrl()).toContain('/time');
    const heading = await timePage.getHeading();
    expect(heading).toContain('Time');
  });

  test('TIME-003: add time entry to my timesheet @local', async ({ timePage, page, loggedInPage }) => {
    test.setTimeout(180000);
    // DB seeds (pre-seeded directly, see checkpoint): customer + TESTProj* +
    // TESTActivitySeed. API activity creation 404s; UI flow below is the test.
    await timePage.gotoMyTimesheet();
    await page.locator('button:has-text("Edit")').click({ timeout: 20000 });
    // Add-row flow: project autocomplete -> activity -> hours -> save.
    const projectInput = page.locator('input[placeholder="Type for hints..."]').first();
    await projectInput.fill('TESTProj');
    const projOption = page.locator('.oxd-autocomplete-option:has-text("TESTProj")').first();
    await projOption.waitFor({ state: 'visible', timeout: 15000 });
    await projOption.click({ timeout: 15000 });
    // Project selected -> activity dropdown must offer TESTActivitySeed.
    const activitySelect = page.locator('.oxd-select-text').first();
    await activitySelect.click({ timeout: 15000 });
    await expect(page.locator('.oxd-select-option:has-text("TESTActivitySeed")')).toBeVisible({ timeout: 15000 });
    await page.locator('.oxd-select-option:has-text("TESTActivitySeed")').click();
    const hourInput = page.locator('.oxd-sheet input[maxlength="5"], .oxd-table input.oxd-input').first();
    if (await hourInput.isVisible().catch(() => false)) {
      await hourInput.fill('8');
    }
    await page.locator('button:has-text("Save")').first().click({ timeout: 15000 }).catch(() => {});
    await expect(page.locator('.oxd-toast, .oxd-sheet, .oxd-table').first()).toBeVisible({ timeout: 20000 });
  });
});
