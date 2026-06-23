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
});
