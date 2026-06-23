import { test, expect } from '../helpers/fixtures';
import { createClaim } from '../helpers/claim-helpers';

test.describe('Claim Edge Cases', () => {

  test('create claim with minimal fields succeeds @local', async ({ claimPage, page, loggedInPage }) => {
    await createClaim(claimPage, page, { remarks: `Minimal ${Date.now()}` });

    const toast = await claimPage.getSuccessToast();
    expect(toast.toLowerCase()).toContain('success');
  });

  test('cancel claim creation resets form @local', async ({ claimPage, page, loggedInPage }) => {
    await claimPage.goto();
    await claimPage.clickAdd();

    await claimPage.fillEmployee('Alice Duval');
    await claimPage.selectEvent('Tech Conference');
    await claimPage.selectCurrency('United States Dollar');
    await claimPage.fillRemarks('Will cancel this');

    const cancelBtn = page.locator('button:has-text("Cancel")');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await page.waitForTimeout(1000);

    const addBtn = page.locator('button:has-text("Assign Claim")');
    await expect(addBtn).toBeVisible();
  });

  test('create claim when form is empty shows validation errors @local', async ({ claimPage, page, loggedInPage }) => {
    await claimPage.goto();
    await claimPage.clickAdd();

    const selects = page.locator('.oxd-select-text-input');
    const selectCount = await selects.count();
    expect(selectCount).toBeGreaterThanOrEqual(2);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const errors = page.locator('.oxd-input-group__message');
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('approve and reject buttons not available on new claim @local', async ({ claimPage, page, loggedInPage }) => {
    await createClaim(claimPage, page, { remarks: `Workflow test ${Date.now()}` });

    const toast = await claimPage.getSuccessToast();
    expect(toast.toLowerCase()).toContain('success');

    const hasApprove = await claimPage.isApproveButtonVisible();
    const hasReject = await claimPage.isRejectButtonVisible();
    expect(hasApprove).toBeFalsy();
    expect(hasReject).toBeFalsy();
  });
});
