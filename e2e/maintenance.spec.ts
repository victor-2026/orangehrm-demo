import { test, expect } from '../helpers/fixtures';
import { CREDENTIALS } from '../helpers/credentials';

test.describe('Maintenance', () => {
  test('MAINT-001: maintenance page shows password screen @smoke', async ({ maintenancePage, loggedInPage }) => {
    await maintenancePage.goto();
    expect(await maintenancePage.getCurrentUrl()).toContain('/maintenance/purgeEmployee');
    expect(await maintenancePage.isPasswordScreenVisible()).toBe(true);
    expect(await maintenancePage.isUsernameDisabled()).toBe(true);
  });

  test('MAINT-002: can enter admin password and see maintenance area @smoke', async ({ maintenancePage, loggedInPage }) => {
    await maintenancePage.goto();
    await maintenancePage.enterPassword(CREDENTIALS.admin.password, true);
    expect(await maintenancePage.getPurgeRecordsFormVisible()).toBe(true);
  });

  test('MAINT-003: wrong password shows authentication error @smoke', async ({ maintenancePage, loggedInPage }) => {
    await maintenancePage.goto();
    await maintenancePage.enterPassword('wrongpassword', false);
    // After wrong password, page should stay on password screen
    // Check that password input is still visible (not error message)
    expect(await maintenancePage.getAuthenticationError()).toBe(true);
  });

  test('MAINT-001: maintenance page shows password screen @local', async ({ maintenancePage, loggedInPage }) => {
    await maintenancePage.goto();
    expect(await maintenancePage.getCurrentUrl()).toContain('/maintenance/purgeEmployee');
    expect(await maintenancePage.isPasswordScreenVisible()).toBe(true);
    expect(await maintenancePage.isUsernameDisabled()).toBe(true);
  });

  test('MAINT-002: can enter admin password and see maintenance area @local', async ({ maintenancePage, loggedInPage }) => {
    await maintenancePage.goto();
    await maintenancePage.enterPassword(CREDENTIALS.admin.password, true);
    expect(await maintenancePage.getPurgeRecordsFormVisible()).toBe(true);
  });

  test('MAINT-003: wrong password shows authentication error @local', async ({ maintenancePage, loggedInPage }) => {
    await maintenancePage.goto();
    await maintenancePage.enterPassword('wrongpassword', false);
    expect(await maintenancePage.getAuthenticationError()).toBe(true);
  });
});
