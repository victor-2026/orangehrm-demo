import { test, expect } from '../helpers/fixtures';
import { applyMutation } from '../helpers/mutations';

test.beforeEach(async ({ page }) => {
  await applyMutation(page, process.env.MUTATION_ID);
});

test.describe('Claim — KISS from Autonoma specs', () => {

  test('1. Assign claim page loads @local', async ({ claimKissPage, page }) => {
    await claimKissPage.gotoAssignClaim();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/viewAssignClaim/);
  });

  test('2. Assign expense claim to employee @local', async ({ claimKissPage }) => {
    await claimKissPage.gotoAssignClaim();
    await claimKissPage.fillEmployee('Alice');
    await claimKissPage.selectEvent('Tech Conference');
    await claimKissPage.selectCurrency('United States Dollar');
    await claimKissPage.fillRemarks('Travel expenses for AWS re:Invent');
    await claimKissPage.clickCreate();

    const toast = await claimKissPage.getToastMessage();
    expect(toast.toLowerCase()).toContain('success');
  });

  test('3. Created claim appears in Employee Claims list @local', async ({ claimKissPage, page }) => {
    await claimKissPage.gotoAssignClaim();
    await claimKissPage.fillEmployee('Alice');
    await claimKissPage.selectEvent('Tech Conference');
    await claimKissPage.selectCurrency('United States Dollar');
    await claimKissPage.fillRemarks('Conference travel');
    await claimKissPage.clickCreate();
    await claimKissPage.getToastMessage();

    await claimKissPage.gotoEmployeeClaims();
    await claimKissPage.searchByEmployee('Alice');
    const visible = await claimKissPage.isClaimInTable('Tech Conference');
    expect(visible).toBe(true);
  });

  test('4. Submit claim page loads and creates a claim @local', async ({ claimKissPage }) => {
    await claimKissPage.gotoMyClaims();
    await claimKissPage.selectEvent('Tech Conference');
    await claimKissPage.selectCurrency('United States Dollar');
    await claimKissPage.fillRemarks('Quarterly Sync Lunch');
    await claimKissPage.clickCreate();

    const toast = await claimKissPage.getToastMessage();
    expect(toast.toLowerCase()).toContain('success');
  });

  test('5. Submitted claim has Initiated status @local', async ({ claimKissPage }) => {
    await claimKissPage.gotoMyClaims();
    await claimKissPage.selectEvent('Tech Conference');
    await claimKissPage.selectCurrency('United States Dollar');
    await claimKissPage.fillRemarks('Team lunch');
    await claimKissPage.clickCreate();
    await claimKissPage.getToastMessage();

    await claimKissPage.gotoMyClaims();
    const initiated = await claimKissPage.isStatusVisible('Initiated');
    expect(initiated).toBe(true);
  });

  test('6. Admin can approve submitted claim @local', async ({ claimKissPage, page }) => {
    // Precondition: create a claim first via employee
    await claimKissPage.gotoMyClaims();
    await claimKissPage.selectEvent('Tech Conference');
    await claimKissPage.selectCurrency('United States Dollar');
    await claimKissPage.fillRemarks('AWS re:Invent Travel');
    await claimKissPage.clickCreate();
    await claimKissPage.getToastMessage();

    // Admin approves
    await claimKissPage.gotoEmployeeClaims();
    await claimKissPage.searchByEmployee('Alice');
    await page.waitForTimeout(1000);

    // Open claim details
    const eyeBtn = page.locator('.oxd-table-body button.oxd-icon-button').first();
    if (await eyeBtn.isVisible().catch(() => false)) {
      await eyeBtn.click();
      await page.waitForLoadState('networkidle');
    }

    await claimKissPage.clickApprove();
    const toast = await claimKissPage.getToastMessage();
    expect(toast.toLowerCase()).toContain('success');
  });

  test('7. Approved claim shows Paid status @local', async ({ claimKissPage, page }) => {
    // Create claim
    await claimKissPage.gotoMyClaims();
    await claimKissPage.selectEvent('Tech Conference');
    await claimKissPage.selectCurrency('United States Dollar');
    await claimKissPage.fillRemarks('Approve test claim');
    await claimKissPage.clickCreate();
    await claimKissPage.getToastMessage();

    // Approve
    await claimKissPage.gotoEmployeeClaims();
    await claimKissPage.searchByEmployee('Alice');
    await page.waitForTimeout(1000);
    const eyeBtn = page.locator('.oxd-table-body button.oxd-icon-button').first();
    if (await eyeBtn.isVisible().catch(() => false)) {
      await eyeBtn.click();
      await page.waitForLoadState('networkidle');
    }
    await claimKissPage.clickApprove();
    await claimKissPage.getToastMessage();

    // Verify Paid status
    await claimKissPage.gotoEmployeeClaims();
    await claimKissPage.searchByEmployee('Alice');
    const paid = await claimKissPage.isStatusVisible('Paid');
    expect(paid).toBe(true);
  });

});
