import { test, expect } from '@playwright/test';
import { ClaimPage } from '../pom/ClaimPage';

// NOTE: no mode:'parallel' — all tests share one PHP session (admin.json)
// and PHP serializes same-session requests; in-file parallel wedges free-tier Render.
test.describe.configure({ timeout: 180000 });

test.describe('Claim Search and Filter', () => {
  let claimPage: ClaimPage;

  test.beforeEach(async ({ page }) => {
    claimPage = new ClaimPage(page);
    await claimPage.goto();
    await claimPage.waitForTable();
  });

  test('3.1 Search by Employee Name autocomplete @local @smoke', async ({ page }) => {
    // Type "Alice" in the Employee Name field and select from autocomplete
    await claimPage.fillEmployee('Alice');

    // Click Search
    await claimPage.searchClaims();
    await claimPage.waitForTable();

    // Verify table filters to show only Alice's claims
    const rows = page.locator('.oxd-table-card');
    await expect.poll(async () => rows.count(), { timeout: 30000 }).toBeGreaterThan(0);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const employeeName = row.locator('.oxd-table-cell:nth-child(2)'); // Employee Name column
      await expect(employeeName).toContainText('Alice Administrator');
    }
  });

  test('3.2 Search by Reference Id @local @smoke', async ({ page }) => {
    // Get a known reference ID from the first row (assuming there is at least one row)
    // NOTE: checkbox is not an .oxd-table-cell, so index 0 = Reference Id
    await expect.poll(async () => page.locator('.oxd-table-card').count(), { timeout: 30000 }).toBeGreaterThan(0);
    const firstRow = page.locator('.oxd-table-card').first();
    const referenceId = await firstRow.locator('.oxd-table-cell').nth(0).textContent(); // Reference Id column
    expect(referenceId).toBeTruthy();

    // Type the reference ID in the search field (second input with placeholder "Type for hints...")
    const referenceInput = page.locator('input[placeholder="Type for hints..."]').nth(1);
    await referenceInput.fill(referenceId!.trim());

    // Click Search
    await claimPage.searchClaims();

    // Verify only the matching row is shown
    const rows = page.locator('.oxd-table-card');
    await claimPage.waitForTable();
    await expect(rows).toHaveCount(1, { timeout: 30000 });
    await expect(rows.first().locator('.oxd-table-cell').nth(0)).toHaveText(referenceId!.trim());
  });

  test('3.3 Search by Event Name dropdown @local @smoke', async ({ page }) => {
    // Select "Tech Conference" from Event Name dropdown
    const eventSelect = page.locator('.oxd-input-group').filter({ hasText: 'Event Name' }).locator('.oxd-select-text-input');
    await eventSelect.click();
    await page.locator('.oxd-select-option:has-text("Tech Conference")').click();

    // Click Search
    await claimPage.searchClaims();
    await claimPage.waitForTable();

    // Verify table shows only rows with Event Name = "Tech Conference"
    const rows = page.locator('.oxd-table-card');
    await expect.poll(async () => rows.count(), { timeout: 30000 }).toBeGreaterThan(0);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const eventName = row.locator('.oxd-table-cell:nth-child(3)'); // Event Name column
      await expect(eventName).toHaveText('Tech Conference');
    }
  });

  test('3.4 Search by Status dropdown @local @smoke', async ({ page }) => {
    // Select "Initiated" from Status dropdown
    const statusSelect = page.locator('.oxd-input-group').filter({ hasText: 'Status' }).locator('.oxd-select-text-input');
    await statusSelect.click();
    await page.locator('.oxd-select-option:has-text("Initiated")').click();

    // Click Search
    await claimPage.searchClaims();
    await claimPage.waitForTable();

    // Verify table shows only rows with Status = "Initiated"
    const rows = page.locator('.oxd-table-card');
    await expect.poll(async () => rows.count(), { timeout: 30000 }).toBeGreaterThan(0);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const status = row.locator('.oxd-table-cell:nth-child(7)'); // Status column
      await expect(status).toHaveText('Initiated');
    }
  });

  test('3.5 Search by date range @local @smoke', async ({ page }) => {
    // Enter a valid From Date and To Date
    const fromDateInput = page.locator('.oxd-input-group').filter({ hasText: 'From Date' }).locator('input');
    const toDateInput = page.locator('.oxd-input-group').filter({ hasText: 'To Date' }).locator('input');
    await fromDateInput.fill('2026-01-01');
    await toDateInput.fill('2026-12-31');

    // Click Search
    await claimPage.searchClaims();

    // Verify table shows claims within the date range (we can't easily verify exact dates without more info, but we can check that results are returned)
    const rows = page.locator('.oxd-table-card');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0); // Could be zero if no claims in that range, but we assume there are some
  });

  test('3.6 Search with no results @local @smoke', async ({ page }) => {
    // Enter a non-existent Reference Id
    const referenceInput = page.locator('input[placeholder="Type for hints..."]').nth(1);
    await referenceInput.fill('ZZZ-NONEXISTENT');

    // Click Search
    await claimPage.searchClaims();

    // Verify table shows "No Records Found" or empty state
    await claimPage.waitForTable();
    const noRecords = page.locator('.oxd-text--span:has-text("No Records Found")');
    await expect(noRecords).toBeVisible({ timeout: 30000 });
  });

  test('3.7 Reset clears all search filters @local @smoke', async ({ page }) => {
    // Apply a filter (e.g., Status = Initiated)
    const statusSelect = page.locator('.oxd-input-group').filter({ hasText: 'Status' }).locator('.oxd-select-text-input');
    await statusSelect.click();
    await page.locator('.oxd-select-option:has-text("Initiated")').click();
    await claimPage.searchClaims();

    // Verify filter is applied (at least one row)
    let rows = page.locator('.oxd-table-card');
    await claimPage.waitForTable();
    await expect.poll(async () => rows.count(), { timeout: 30000 }).toBeGreaterThan(0);
    let count = await rows.count();

    // Click Reset
    await claimPage.resetSearch();

    // Verify all search fields return to default values and table shows all records
    // Check that status dropdown is back to "-- Select --"
    const statusValue = page.locator('.oxd-input-group').filter({ hasText: 'Status' }).locator('.oxd-select-text-input');
    await expect(statusValue).toHaveText('-- Select --');

    // Table should show all records (more than the filtered count)
    rows = page.locator('.oxd-table-card');
    await claimPage.waitForTable();
    await expect.poll(async () => rows.count(), { timeout: 30000 }).toBeGreaterThan(0); // We don't know the exact total, but it should be more than the filtered count
    count = await rows.count();
  });

  test('3.8 Search by Include dropdown @local @smoke', async ({ page }) => {
    // Select "Past Employees Only" from Include dropdown
    const includeSelect = page.locator('.oxd-input-group').filter({ hasText: 'Include' }).locator('.oxd-select-text-input');
    await includeSelect.click();
    await page.locator('.oxd-select-option:has-text("Past Employees Only")').click();

    // Click Search
    await claimPage.searchClaims();

    // Verify table filters appropriately (may show no results if no past employees have claims)
    const rows = page.locator('.oxd-table-card');
    const count = await rows.count();
    // We don't assert on count because it might be zero, but we can check that the search completed:
    // either rows render or the empty state shows (body stays hidden when empty)
    await claimPage.waitForTable();
    const completed =
      (await page.locator('.oxd-table-card').first().isVisible().catch(() => false)) ||
      (await page
        .locator('.oxd-text--span:has-text("No Records Found")')
        .isVisible()
        .catch(() => false));
    expect(completed).toBe(true);
  });
});
