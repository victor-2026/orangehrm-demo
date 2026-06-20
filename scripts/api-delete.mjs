import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

page.on('request', req => {
  const url = req.url();
  if (url.includes('/api/v2/pim') && req.method() === 'DELETE') {
    console.log('DELETE:', url);
  }
  if (url.includes('/api/v2/pim') && (req.method() === 'POST' || req.method() === 'PATCH')) {
    console.log(req.method(), ':', url);
    console.log('  BODY:', req.postData());
  }
});
page.on('response', async resp => {
  const url = resp.url();
  if (url.includes('/api/v2/pim/employees') && resp.status() >= 200) {
    try { const j = await resp.json(); console.log('RESP', resp.status(), '- data:', JSON.stringify(j).substring(0,200)); } catch(e) {}
  }
});

await page.goto('http://localhost:8080/web/index.php/auth/login');
await page.fill('input[name="username"]', 'Admin');
await page.fill('input[name="password"]', 'Orangehrm@2026');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard/**');

// Go to PIM and delete employee #46
await page.goto('http://localhost:8080/web/index.php/pim/viewEmployeeList');
await page.waitForTimeout(2000);

// Search for Eve Recruiter (#46 might not be unique)
// Let's add an employee first and then delete it via UI
await page.goto('http://localhost:8080/web/index.php/pim/addEmployee');
await page.waitForTimeout(1000);
await page.fill('input[name="firstName"]', 'DeleteMe');
await page.fill('input[name="lastName"]', 'Test');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);
console.log('Added test employee');

// Now go to list and try to delete
await page.goto('http://localhost:8080/web/index.php/pim/viewEmployeeList');
await page.waitForTimeout(2000);
await page.fill('.oxd-input-group input.oxd-input:not([readonly])', 'DeleteMe');
await page.click('button:has-text("Search")');
await page.waitForTimeout(2000);

// Click delete button
const delBtn = page.locator('.oxd-table-cell-actions button').first();
if (await delBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  await delBtn.click();
  await page.waitForTimeout(500);
  await page.click('button:has-text("Yes, Delete")');
  await page.waitForTimeout(3000);
  console.log('Delete confirmed');
}

await browser.close();
