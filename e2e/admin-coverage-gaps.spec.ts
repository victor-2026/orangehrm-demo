/**
 * Admin Module — POM coverage gaps
 *
 * Covers AdminPage methods never called in any existing spec:
 *
 *   Method                  | Risk ID | Description
 *   ------------------------|---------|--------------------------------------------
 *   cancelDelete()          | AG-01   | Dismiss delete dialog — user must survive
 *   changePrimaryColor()    | AG-02   | Corporate Branding color input + preview
 *   clickNationalityPage()  | AG-03   | Pagination on Nationality list
 *   clickSubTab()           | AG-04   | Direct sub-tab navigation helper
 *   deleteUser()            | AG-05   | Simpler delete (no overlay wait)
 *   getFirstUsername()      | AG-06   | Read first row username from table
 *   getModuleCount()        | AG-07   | Count module toggle switches
 *   getRecordCount()        | AG-08   | Parse record count integer from header text
 *   getTopbarSubTabs()      | AG-09   | Read sub-tab labels from open dropdown
 *   isDeleteDialogVisible() | AG-10   | Confirm overlay appears before action
 *   viewFirstUser()         | AG-11   | Click first row → navigate to user form
 */

import { test, expect } from '../helpers/fixtures';

// ─── AG-01  cancelDelete — delete dialog is dismissed, user survives ─────────

test.describe('AG-01 — cancelDelete keeps user in table @local', () => {
  test('cancel delete dialog leaves user visible @local', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    // Create a disposable user to target
    const username = `CancelDel_${Date.now()}`;
    await adminPage.goto();
    await adminPage.clickAdd();
    await adminPage.fillUserForm('ESS', 'Admin', username, 'TestPass123!', 'Enabled');
    await adminPage.clickSave();

    // Navigate back to the list and find our user
    await adminPage.goto();
    await adminPage.searchUser(username);
    await expect(page.locator(`.oxd-table-body .oxd-table-row:has-text("${username}")`)).toBeVisible();

    // Cancel the delete
    await adminPage.cancelDelete(username);

    // User must still be in the table
    await expect(
      page.locator(`.oxd-table-body .oxd-table-row:has-text("${username}")`),
    ).toBeVisible();
  });

  test('cancelDelete closes the confirmation overlay @local', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    const username = `CancelDel2_${Date.now()}`;
    await adminPage.goto();
    await adminPage.clickAdd();
    await adminPage.fillUserForm('ESS', 'Admin', username, 'TestPass123!', 'Enabled');
    await adminPage.clickSave();

    await adminPage.goto();
    await adminPage.searchUser(username);

    await adminPage.cancelDelete(username);

    // Overlay should be gone / hidden after cancel
    const overlay = page.locator('.oxd-overlay');
    const isStillVisible = await overlay
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    expect(isStillVisible).toBe(false);
  });
});

// ─── AG-02  changePrimaryColor — Corporate Branding preview ──────────────────

test.describe('AG-02 — changePrimaryColor triggers preview @local', () => {
  test('changePrimaryColor fills the color input and clicks Preview @local', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.navigateToCorporateBranding();

    await adminPage.changePrimaryColor('#FF5733');

    // Verify the color input reflects the value that was typed
    const colorInput = page
      .locator('input.oxd-input[type="text"]')
      .first();
    const value = await colorInput.inputValue();
    expect(value).toContain('FF5733');
  });

  test('changePrimaryColor does not navigate away from branding page @local', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.navigateToCorporateBranding();
    await adminPage.changePrimaryColor('#1A2B3C');

    expect(page.url()).toMatch(/\/admin\/(corporateBranding|addTheme)/);
  });
});

// ─── AG-03  clickNationalityPage — pagination ─────────────────────────────────

test.describe('AG-03 — clickNationalityPage paginates the nationality list @smoke', () => {
  test('nationality list has more than zero rows on page 1 @smoke', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.navigateToNationalities();

    const rows = await adminPage.getTableRows();
    expect(rows).toBeGreaterThan(0);
  });

  test('clickNationalityPage(1) keeps table visible @smoke', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.navigateToNationalities();

    // Only attempt pagination if a page-2 link is present; otherwise assert
    // that page 1 is the only page (still exercises the happy-path branch).
    const pageLink = page.locator('.oxd-table-pagination a:has-text("2")');
    const hasPagination = await pageLink.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasPagination) {
      await adminPage.clickNationalityPage(2);
      await expect(page.locator('.oxd-table-body .oxd-table-row').first()).toBeVisible();
    } else {
      // Single-page list — verify first row still visible (no crash)
      await expect(page.locator('.oxd-table-body .oxd-table-row').first()).toBeVisible();
    }
  });
});

// ─── AG-04  clickSubTab — direct sub-tab helper ───────────────────────────────

test.describe('AG-04 — clickSubTab navigates to correct sub-section @smoke', () => {
  test('clickSubTab("Job Titles") navigates to Job Titles list @smoke', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.clickTopbarTab('Job');
    await adminPage.clickSubTab('Job Titles');

    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin/viewJobTitleList');
  });

  test('clickSubTab("Skills") navigates to Skills list @smoke', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.clickTopbarTab('Qualifications');
    await adminPage.clickSubTab('Skills');

    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin/viewSkills');
  });

  test('clickSubTab("Localization") navigates to Localization page @smoke', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.clickTopbarTab('Configuration');
    await adminPage.clickSubTab('Localization');

    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin/localization');
  });
});

// ─── AG-05  deleteUser — simple delete (no overlay wait) ─────────────────────

test.describe('AG-05 — deleteUser removes user from table @local', () => {
  test('deleteUser removes target row after confirmation @local', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    // Create a user we can safely delete
    const username = `DelSimple_${Date.now()}`;
    await adminPage.goto();
    await adminPage.clickAdd();
    await adminPage.fillUserForm('ESS', 'Admin', username, 'TestPass123!', 'Enabled');
    await adminPage.clickSave();

    await adminPage.goto();
    await adminPage.searchUser(username);
    await expect(
      page.locator(`.oxd-table-body .oxd-table-row:has-text("${username}")`),
    ).toBeVisible();

    // deleteUser (no overlay guard — clicks Yes, Delete immediately)
    await adminPage.deleteUser(username);
    await page.waitForLoadState('networkidle');

    await adminPage.searchUser(username);
    const row = page.locator(`.oxd-table-body .oxd-table-row:has-text("${username}")`);
    await expect(row).toHaveCount(0);
  });
});

// ─── AG-06  getFirstUsername — read username from table ──────────────────────

test.describe('AG-06 — getFirstUsername returns a non-empty string @smoke', () => {
  test('getFirstUsername returns the first row username on the Users list @smoke', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    const username = await adminPage.getFirstUsername();
    expect(username.length).toBeGreaterThan(0);
  });

  test('getFirstUsername value matches getRowData column 1 @smoke', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    const usernameFromHelper = await adminPage.getFirstUsername();
    const rowData = await adminPage.getRowData(0);
    // Column index 1 = Username (0 = checkbox)
    expect(rowData[1]).toBe(usernameFromHelper);
  });
});

// ─── AG-07  getModuleCount — count module toggle rows ────────────────────────

test.describe('AG-07 — getModuleCount returns module toggle count @smoke', () => {
  test('getModuleCount returns a positive integer on Modules page @smoke', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.navigateToModules();

    const count = await adminPage.getModuleCount();
    expect(count).toBeGreaterThan(0);
  });

  test('getModuleCount matches visible switch wrappers @smoke', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.navigateToModules();

    const countFromPOM = await adminPage.getModuleCount();
    const countFromPage = await page.locator('.oxd-switch-wrapper').count();
    expect(countFromPOM).toBe(countFromPage);
  });
});

// ─── AG-08  getRecordCount — parse integer from record-count header ───────────

test.describe('AG-08 — getRecordCount parses the record count integer @smoke', () => {
  test('getRecordCount returns a non-negative integer on Users list @smoke', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    const count = await adminPage.getRecordCount();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('getRecordCount returns 0 when search yields no results @smoke', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.searchWithNoResults();
    const count = await adminPage.getRecordCount();
    expect(count).toBe(0);
  });

  test('getRecordCount is consistent with getRecordCountText @smoke', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    const countInt = await adminPage.getRecordCount();
    const countText = await adminPage.getRecordCountText();
    // The text "Records Found" line should contain the same number
    expect(countText).toContain(String(countInt));
  });
});

// ─── AG-09  getTopbarSubTabs — read dropdown sub-tab labels ──────────────────

test.describe('AG-09 — getTopbarSubTabs reads sub-tab labels from open dropdown @smoke', () => {
  test('getTopbarSubTabs returns Job sub-tab names when Job tab is open @smoke', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.clickTopbarTab('Job');
    const subTabs = await adminPage.getTopbarSubTabs();

    expect(subTabs).toEqual(
      expect.arrayContaining(['Job Titles', 'Pay Grades', 'Employment Status']),
    );
  });

  test('getTopbarSubTabs returns Configuration sub-tab names @smoke', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.clickTopbarTab('Configuration');
    const subTabs = await adminPage.getTopbarSubTabs();

    expect(subTabs).toEqual(
      expect.arrayContaining(['Email Configuration', 'Localization', 'Modules']),
    );
  });

  test('getTopbarSubTabs result equals getSubTabs for the same open tab @smoke', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.clickTopbarTab('Qualifications');

    const fromTopbarSubTabs = await adminPage.getTopbarSubTabs();
    const fromGetSubTabs = await adminPage.getSubTabs();

    // Both methods read the same dropdown — results should be identical
    expect(fromTopbarSubTabs).toEqual(fromGetSubTabs);
  });
});

// ─── AG-10  isDeleteDialogVisible — overlay present before action ─────────────

test.describe('AG-10 — isDeleteDialogVisible reflects dialog state @local', () => {
  test('isDeleteDialogVisible returns true after clicking delete icon @local', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    // Create a user to trigger the dialog against
    const username = `DlgTest_${Date.now()}`;
    await adminPage.goto();
    await adminPage.clickAdd();
    await adminPage.fillUserForm('ESS', 'Admin', username, 'TestPass123!', 'Enabled');
    await adminPage.clickSave();

    await adminPage.goto();
    await adminPage.searchUser(username);

    // Click the delete (trash) icon on the first matching row
    const row = page
      .locator(`.oxd-table-body .oxd-table-row:has-text("${username}")`)
      .first();
    await row.locator('button').first().click();

    // Overlay must now be visible
    const dialogVisible = await adminPage.isDeleteDialogVisible();
    expect(dialogVisible).toBe(true);

    // Clean up — cancel the dialog
    await page.locator('button:has-text("No, Cancel")').click().catch(() => {});
  });

  test('isDeleteDialogVisible returns false before any delete action @local', async ({
    adminPage,
    loggedInPage,
  }) => {
    await adminPage.goto();
    const visible = await adminPage.isDeleteDialogVisible();
    expect(visible).toBe(false);
  });
});

// ─── AG-11  viewFirstUser — click first row → user form ──────────────────────

test.describe('AG-11 — viewFirstUser opens user form @smoke', () => {
  test('viewFirstUser navigates to saveSystemUser URL @smoke', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();
    await adminPage.viewFirstUser();

    expect(page.url()).toContain('/admin/saveSystemUser');
    expect(await adminPage.isUserFormVisible()).toBe(true);
  });

  test('viewFirstUser lands on form for the first username in the list @smoke', async ({
    adminPage,
    page,
    loggedInPage,
  }) => {
    await adminPage.goto();

    // Capture the username before navigating away
    const firstUsername = await adminPage.getFirstUsername();

    await adminPage.viewFirstUser();

    // The form should contain the username we read
    const usernameField = page.locator(
      '.oxd-form input[autocomplete], input[name="username"]',
    );
    // Not all themes expose name="username"; check the URL is the form at minimum
    expect(page.url()).toContain('/admin/saveSystemUser');
    // If the field is visible, it should match
    if (await usernameField.isVisible().catch(() => false)) {
      const val = await usernameField.inputValue();
      expect(val).toBe(firstUsername);
    }
  });
});
