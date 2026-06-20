import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

page.on('request', req => {
  const url = req.url();
  if (url.includes('/api/v2/pim/employees') && req.method() === 'POST') {
    console.log('POST BODY:', req.postData());
  }
});
page.on('response', async resp => {
  const url = resp.url();
  if (url.includes('/api/v2/pim/employees') && resp.status() >= 200) {
    console.log('RESP', resp.status(), url);
    try { console.log('  DATA:', JSON.stringify(await resp.json())); } catch(e) {}
  }
});

await page.goto('http://localhost:8080/web/index.php/auth/login');
await page.fill('input[name="username"]', 'Admin');
await page.fill('input[name="password"]', 'Orangehrm@2026');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard/**');

await page.goto('http://localhost:8080/web/index.php/pim/addEmployee');
await page.waitForTimeout(1000);

await page.fill('input[name="firstName"]', 'TestAPI');
await page.fill('input[name="lastName"]', 'UserAPI');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);

await browser.close();
