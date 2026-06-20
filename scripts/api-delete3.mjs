import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

// Log ALL requests
page.on('request', req => {
  const url = req.url();
  const m = req.method();
  if (url.includes('/api/v2') && (m === 'POST' || m === 'DELETE' || m === 'PATCH')) {
    console.log('\n***', m, url.split('/web')[1] || url.split('localhost')[1]);
    try { console.log('   BODY:', req.postData()?.substring(0, 300)); } catch(e) {}
  }
});
page.on('response', async resp => {
  const url = resp.url();
  const m = resp.request().method();
  if (url.includes('/api/v2') && (m === 'POST' || m === 'DELETE' || m === 'PATCH') && resp.url().includes('admin/users')) {
    console.log('<<<', resp.status(), url.split('/web')[1]);
  }
});

await page.goto('http://localhost:8080/web/index.php/auth/login');
await page.fill('input[name="username"]', 'Admin');
await page.fill('input[name="password"]', 'Orangehrm@2026');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard/**');

// Go to Admin -> Users
await page.goto('http://localhost:8080/web/index.php/admin/viewSystemUsers');
await page.waitForTimeout(2000);

// Delete the 2nd user (test_create_api) - click trash icon
const trashIcons = page.locator('.oxd-table-cell-actions i.bi-trash');
const count = await trashIcons.count();
console.log('\nFound', count, 'trash icons');

if (count > 1) {
  await trashIcons.nth(1).click(); // 2nd user = test_create_api
  await page.waitForTimeout(1000);

  // Confirm in modal
  const confirmBtn = page.locator('button:has-text("Yes, Delete")');
  if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmBtn.click();
    console.log('Clicked Yes, Delete');
    await page.waitForTimeout(3000);
  }
}

await browser.close();
