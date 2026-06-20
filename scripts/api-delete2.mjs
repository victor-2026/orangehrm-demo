import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

page.on('request', req => {
  const url = req.url();
  if (url.includes('/api/v2/pim/employees') && ['POST','DELETE','PATCH'].includes(req.method())) {
    console.log('REQ:', req.method(), url.split('/web')[1] || url);
    try { console.log('  BODY:', req.postData()); } catch(e) {}
  }
  if (url.includes('/api/v2/admin/users') && ['POST','DELETE','PATCH'].includes(req.method())) {
    console.log('REQ:', req.method(), url.split('/web')[1] || url);
    try { console.log('  BODY:', req.postData()); } catch(e) {}
  }
});
page.on('response', async resp => {
  const url = resp.url();
  if (url.includes('/api/v2/pim/employees') || url.includes('/api/v2/admin/users')) {
    const reqMethod = resp.request().method();
    if (['POST','DELETE','PATCH'].includes(reqMethod)) {
      console.log('RESP:', resp.status(), url.split('/web')[1] || url);
      try { const j = await resp.json(); console.log('  DATA:', JSON.stringify(j).substring(0,300)); } catch(e) {}
    }
  }
});

await page.goto('http://localhost:8080/web/index.php/auth/login');
await page.fill('input[name="username"]', 'Admin');
await page.fill('input[name="password"]', 'Orangehrm@2026');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard/**');

// Go directly to PIM list and click delete on first row
await page.goto('http://localhost:8080/web/index.php/pim/viewEmployeeList');
await page.waitForTimeout(2000);

// Click the delete icon on the first row
const deleteIcons = page.locator('.oxd-table-cell-actions i.bi-trash');
if (await deleteIcons.first().isVisible({ timeout: 3000 }).catch(() => false)) {
  await deleteIcons.first().click();
  await page.waitForTimeout(1000);
  // Click "Yes, Delete" in modal
  const modalBtn = page.locator('.oxd-dialog-container-fast-motion button:has-text("Yes, Delete")');
  if (await modalBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await modalBtn.click();
    await page.waitForTimeout(3000);
    console.log('Delete confirmed via modal');
  }
}

await browser.close();
