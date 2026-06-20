const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const outDir = path.join(__dirname, '..', 'exploration', 'claim');
  fs.mkdirSync(outDir, { recursive: true });

  // Login
  await page.goto('http://localhost:8080/web/index.php/auth/login');
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'Orangehrm@2026');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.oxd-topbar-header-title', { timeout: 15000 });
  console.log('Logged in ✓');

  // Navigate to Claim via sidebar menu
  await page.goto('http://localhost:8080/web/index.php/claim/viewAssignClaim');
  await page.waitForTimeout(1500);

  // Explore Configuration tab via JavaScript click
  const tabs = page.locator('.oxd-topbar-body-nav-tab-item');
  const tabCount = await tabs.count();
  console.log(`\nFound ${tabCount} tabs`);

  for (let i = 0; i < tabCount; i++) {
    const tabText = await tabs.nth(i).textContent();
    console.log(`Tab ${i}: "${tabText}"`);
  }

  // Click Configuration tab (index 0)
  await tabs.nth(0).click();
  await page.waitForTimeout(2000);
  console.log(`\nAfter clicking Configuration tab — URL: ${page.url()}`);

  await page.screenshot({ path: path.join(outDir, '14-configuration-tab.png'), fullPage: true });

  // Dump Configuration page state
  const configState = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('.oxd-topbar-header-title, .oxd-text--h6, h6')).map(h => h.textContent?.trim()).filter(Boolean);
    const buttons = Array.from(document.querySelectorAll('button.oxd-button, button[type="button"]')).map(b => ({ text: b.textContent?.trim(), class: b.className?.slice(0, 60) })).filter(b => b.text);
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"])')).map(i => i.placeholder || i.name || '').filter(Boolean);
    const tables = Array.from(document.querySelectorAll('.oxd-table')).map(t => ({
      headers: Array.from(t.querySelectorAll('.oxd-table-header-cell')).map(c => c.textContent?.trim()).filter(Boolean),
      rows: t.querySelectorAll('.oxd-table-card').length,
    }));
    const labels = Array.from(document.querySelectorAll('.oxd-label')).map(l => l.textContent?.trim()).filter(Boolean);
    const allText = document.body?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 2000);
    return { url: window.location.href, headings, buttons, inputs, tables, labels, allText };
  });

  console.log(JSON.stringify(configState, null, 2));

  // Check existing claim table data
  await page.goto('http://localhost:8080/web/index.php/claim/viewAssignClaim');
  await page.waitForTimeout(1500);

  // Read table data
  const tableData = await page.evaluate(() => {
    const cards = document.querySelectorAll('.oxd-table-card');
    return Array.from(cards).slice(0, 3).map(card => ({
      cells: Array.from(card.querySelectorAll('.oxd-table-cell')).map(cell => cell.textContent?.trim()),
    }));
  });
  console.log('\nExisting claim table rows:', JSON.stringify(tableData, null, 2));

  // Check for pagination
  const pagination = await page.locator('.oxd-pagination, .oxd-pagination-page-item').isVisible({ timeout: 1000 }).catch(() => false);
  console.log(`Pagination visible: ${pagination}`);

  // Try "Submit Claim" on My Claims page
  await page.goto('http://localhost:8080/web/index.php/claim/viewClaim');
  await page.waitForTimeout(1000);

  const submitClaimBtn = page.locator('button:has-text("Submit Claim")');
  if (await submitClaimBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Submit Claim button visible on My Claims page');
  }

  // Check if there's already a claim for current user — try the "Create" flow on Submit page
  await page.goto('http://localhost:8080/web/index.php/claim/submitClaim');
  await page.waitForTimeout(1000);

  // Check Remarks textarea
  const textarea = page.locator('textarea');
  const textareaVisible = await textarea.isVisible({ timeout: 1000 }).catch(() => false);
  console.log(`\nRemarks textarea visible: ${textareaVisible}`);

  // Check for any file attachment
  const fileInput = page.locator('input[type="file"]');
  const fileVisible = await fileInput.isVisible({ timeout: 1000 }).catch(() => false);
  console.log(`File input visible: ${fileVisible}`);

  // Check Claim Events via Configuration
  await page.goto('http://localhost:8080/web/index.php/claim/viewAssignClaim');
  await page.waitForTimeout(1000);
  const configTab = page.locator('.oxd-topbar-body-nav-tab-item').first();
  await configTab.click();
  await page.waitForTimeout(2000);

  // Look for any Add/Edit buttons
  const addBtn = page.locator('button:has-text("Add")');
  const addVisible = await addBtn.isVisible({ timeout: 1000 }).catch(() => false);
  console.log(`Add button on Configuration: ${addVisible}`);

  const editBtns = page.locator('button:has-text("Edit")');
  const editCount = await editBtns.count().catch(() => 0);
  console.log(`Edit buttons on Configuration: ${editCount}`);

  console.log('\n========== DONE ==========');
  await browser.close();
})();
