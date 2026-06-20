import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

const apiCalls = [];
page.on('request', req => {
  const url = req.url();
  if (url.includes('/api/v2/') && ['POST','PUT','DELETE'].includes(req.method())) {
    apiCalls.push({ method: req.method(), url: url, body: req.postData() });
  }
});

await page.goto('http://localhost:8080/web/index.php/auth/login');
await page.fill('input[name="username"]', 'Admin');
await page.fill('input[name="password"]', 'Orangehrm@2026');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard/**');

// Go to Admin -> Users -> Add
await page.goto('http://localhost:8080/web/index.php/admin/viewSystemUsers');
await page.waitForTimeout(1000);
await page.click('button:has-text("Add")');
await page.waitForTimeout(500);

// Fill user form
await page.fill('.oxd-input-group input.oxd-input:not([readonly])', 'testuser_api');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);

// Buzz - create post
await page.goto('http://localhost:8080/web/index.php/buzz/viewBuzz');
await page.waitForTimeout(2000);
await page.fill('textarea.oxd-buzz-post-input', 'Test post from API check');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);

console.log('\n=== MUTATE API CALLS ===');
for (const c of apiCalls) {
  console.log(c.method, c.url.replace('http://localhost:8080', ''));
  if (c.body) console.log('  ', c.body.substring(0, 300));
}

await browser.close();
