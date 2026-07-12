import { test, expect } from '@playwright/test';
import { ClaimPage } from '../pom/ClaimPage';

test.describe.configure({ mode: 'parallel' });

test.describe('Claim Validation Edge Cases', () => {
  let claimPage: ClaimPage;

  test.beforeEach(async ({ page }) => {
    claimPage = new ClaimPage(page);
    await claimPage.goto();
    await claimPage.clickAdd(); // Navigate to Assign Claim form
  });

  test('6.1 Submit with empty required fields — Employee Name @local @smoke', async ({ page }) => {
    // Leave Employee Name empty
    // Select Event and Currency
    await claimPage.selectEvent('Tech Conference');
    await claimPage.selectCurrency('United States Dollar');
    await claimPage.fillRemarks('Test claim without employee');

    // Click Create
    await claimPage.clickCreate();

    // Verify validation error shown under Employee Name
    const error = page.locator('.oxd-input-group:has-text("Employee Name") .oxd-input-group__message');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Required');

    // Verify no navigation occurs (still on assignClaim page)
    await expect(page).toHaveURL(/.*assignClaim/);
  });

  test('6.2 Submit with empty required fields — Event @local @smoke', async ({ page }) => {
    // Fill Employee Name
    await claimPage.fillEmployee('Alice Administrator');
    // Leave Event as "-- Select --"
    // Fill Currency and Remarks
    await claimPage.selectCurrency('United States Dollar');
    await claimPage.fillRemarks('Test claim without event');

    // Click Create
    await claimPage.clickCreate();

    // Verify validation error shown under Event
    const error = page.locator('.oxd-input-group:has-text("Event") .oxd-input-group__message');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Required');

    // Verify no navigation occurs
    await expect(page).toHaveURL(/.*assignClaim/);
  });

  test('6.3 Submit with empty required fields — Currency @local @smoke', async ({ page }) => {
    // Fill Employee Name and Event
    await claimPage.fillEmployee('Alice Administrator');
    await claimPage.selectEvent('Tech Conference');
    // Leave Currency as "-- Select --"
    await claimPage.fillRemarks('Test claim without currency');

    // Click Create
    await claimPage.clickCreate();

    // Verify validation error shown under Currency
    const error = page.locator('.oxd-input-group:has-text("Currency") .oxd-input-group__message');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Required');

    // Verify no navigation occurs
    await expect(page).toHaveURL(/.*assignClaim/);
  });
});
