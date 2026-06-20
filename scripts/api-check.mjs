import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('request', req => {
  const url = req.url();
  if (url.includes('/api/')) {
    console.log('API:', req.method(), url);
  }
});

await page.goto('http://localhost:8080/web/index.php/auth/login');
await page.fill('input[name="username"]', 'Admin');
await page.fill('input[name="password"]', 'Orangehrm@2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);

await page.goto('http://localhost:8080/web/index.php/pim/viewEmployeeList');
await page.waitForTimeout(3000);

await browser.close();
