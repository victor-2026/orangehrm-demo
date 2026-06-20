import { test, expect } from '../helpers/fixtures';

test.describe('Claim', () => {
  test('claim page loads @smoke', async ({ claimPage, loggedInPage }) => {
    await claimPage.goto();
    const heading = await claimPage.getHeading();
    expect(heading).toContain('Claim');
  });
test('all 5 navigation tabs visible @smoke', async ({ claimPage, page, loggedInPage }) => {
  await claimPage.goto();
  const tabLocator = page.locator('.oxd-topbar-body-nav-tab-item');
  await expect(tabLocator).toHaveCount(5);
  const texts = await tabLocator.allTextContents();
  expect(texts.map(t => t.trim())).toEqual([
    'Configuration',
    'Submit Claim',
    'My Claims',
    'Employee Claims',
    'Assign Claim',
  ]);
});
test('submit claim page loads @smoke', async ({ page, claimPage, loggedInPage }) => {
  await claimPage.goto();
  await claimPage.clickAdd();
  await expect(page.locator('.orangehrm-main-title')).toContainText('Create Claim Request');
});
test('my claims page loads @smoke', async ({ page, loggedInPage }) => {
  await page.goto('/web/index.php/claim/viewClaim');
  await page.waitForTimeout(1000);
  await expect(page.locator('h5')).toContainText('My Claims');
});
test('navigate to submit claim tab @smoke', async ({ page, claimPage, loggedInPage }) => {
  await claimPage.goto();
  await page.click('a:has-text("Submit Claim")');
  await expect(page.getByRole('heading', { name: 'Create Claim Request' })).toBeVisible();
});
  test('claim table visible @smoke', async ({ claimPage, loggedInPage }) => {
    await claimPage.goto();
    const visible = await claimPage.isClaimListVisible();
    expect(visible).toBe(true);
  });

  test('assign claim via UI @local', async ({ page, claimPage, loggedInPage }) => {
    await claimPage.goto();
    await claimPage.clickAdd();
    expect(page.url()).toContain('/claim/assignClaim');
    await claimPage.fillEmployee('Alice');
    await claimPage.selectEvent('Tech Conference');
    await claimPage.selectCurrency('United States Dollar');
    await claimPage.fillRemarks('UI-based test claim');
    await claimPage.clickCreate();
    const toast = await claimPage.getSuccessToast();
    expect(toast.length).toBeGreaterThan(0);
  });

  test('search claims by status @local', async ({ claimPage, page, loggedInPage }) => {
    await claimPage.goto();
    await page.waitForSelector('.oxd-table-card', { timeout: 5000 });
    const initialRows = await page.locator('.oxd-table-card').count();
    expect(initialRows).toBeGreaterThan(0);
    const statusInput = page.locator('.oxd-input-group:has-text("Status") .oxd-select-text-input');
    await statusInput.click();
    await page.locator('.oxd-select-option:has-text("Paid")').click();
    await page.click('button:has-text("Search")');
    await page.waitForResponse(
      r => r.url().includes('/api/v2/claim') && r.status() === 200,
      { timeout: 10000 }
    );
    const filteredRows = await page.locator('.oxd-table-card').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test('validate required fields on assign claim @local', async ({ page, claimPage, loggedInPage }) => {
    await claimPage.goto();
    await claimPage.clickAdd();
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const errors = page.locator('.oxd-input-group__message');
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThan(0);
  });
});
