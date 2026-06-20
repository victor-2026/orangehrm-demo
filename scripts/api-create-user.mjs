import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

page.on('request', req => {
  const url = req.url();
  if (url.includes('/api/v2/admin') && req.method() === 'POST') {
    console.log('\n=== POST ===');
    console.log('URL:', url.split('/web')[1]);
    console.log('BODY:', req.postData());
  }
});
page.on('response', async resp => {
  const url = resp.url();
  if (url.includes('/api/v2/admin') && resp.status() >= 200) {
    const method = resp.request().method();
    if (method === 'POST') {
      console.log('RESP:', resp.status());
      try { console.log('  JSON:', JSON.stringify(await resp.json()).substring(0,500)); } catch(e) { console.log('  no json'); }
    }
  }
});

await page.goto('http://localhost:8080/web/index.php/auth/login');
await page.fill('input[name="username"]', 'Admin');
await page.fill('input[name="password"]', 'Orangehrm@2026');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard/**');
console.log('LOGGED IN');

await page.goto('http://localhost:8080/web/index.php/admin/viewSystemUsers');
await page.waitForTimeout(1000);
await page.click('button:has-text("Add")');
await page.waitForTimeout(1000);

// User Role = Admin
await page.locator('.oxd-select-text-input').nth(0).click();
await page.waitForTimeout(300);
await page.locator('.oxd-select-option').filter({ hasText: 'Admin' }).click();
await page.waitForTimeout(300);

// Employee Name - type admin
await page.locator('input[placeholder="Type for hints..."]').fill('Admin');
await page.waitForTimeout(2000);
const opt = page.locator('.oxd-autocomplete-option').first();
if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) {
  await opt.click();
}
await page.waitForTimeout(500);

// Status = Enabled
await page.locator('.oxd-select-text-input').nth(1).click();
await page.waitForTimeout(200);
await page.locator('.oxd-select-option').filter({ hasText: 'Enabled' }).click();
await page.waitForTimeout(200);

// Fill username by looking for oxd-input without readonly
const inputs = page.locator('.oxd-form .oxd-input');
const count = await inputs.count();
for (let i = 0; i < count; i++) {
  const val = await inputs.nth(i).inputValue();
  if (val === '' && !(await inputs.nth(i).getAttribute('readonly'))) {
    await inputs.nth(i).fill('test_create_api');
    console.log('Filled username at index', i);
    break;
  }
}
await page.waitForTimeout(300);

// Password fields
const pwds = page.locator('input[type="password"]');
await pwds.nth(0).fill('TestPass@123');
await pwds.nth(1).fill('TestPass@123');

await page.click('button[type="submit"]');
console.log('Submitted');
await page.waitForTimeout(3000);

console.log('Final URL:', page.url());
await browser.close();
