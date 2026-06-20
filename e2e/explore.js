const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const outDir = path.join(__dirname, '..', 'exploration');
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Login page
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.waitForSelector('.orangehrm-login-branding', { timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, '01-login-page.png'), fullPage: true });
  console.log('Login page loaded ✓');

  // Grab all input fields and labels
  const loginFields = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const labels = document.querySelectorAll('label');
    return {
      title: document.title,
      url: window.location.href,
      inputs: Array.from(inputs).map(i => ({ name: i.name, type: i.type, placeholder: i.placeholder, id: i.id })),
      labels: Array.from(labels).map(l => ({ text: l.textContent?.trim(), htmlFor: l.htmlFor })),
      buttons: Array.from(document.querySelectorAll('button')).map(b => ({ text: b.textContent?.trim(), type: b.type })),
    };
  });
  console.log('Login elements:', JSON.stringify(loginFields, null, 2).slice(0, 500));

  // 2. Login with default credentials
  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.oxd-topbar-header-title', { timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, '02-dashboard.png'), fullPage: true });
  console.log('Logged in ✓');

  // 3. Explore main menu
  const menuItems = await page.evaluate(() => {
    const items = document.querySelectorAll('.oxd-main-menu-item');
    return Array.from(items).map(el => ({
      text: el.textContent?.trim(),
      href: el.getAttribute('href'),
    }));
  });
  console.log('Menu items:', JSON.stringify(menuItems, null, 2));

  // 4. Visit each menu item and screenshot
  const results = [];
  for (const item of menuItems) {
    if (!item.href) continue;
    const label = item.text?.replace(/\s+/g, '-').toLowerCase() || 'unknown';
    try {
      await page.goto(`https://opensource-demo.orangehrmlive.com${item.href}`);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(outDir, `03-${label}.png`), fullPage: true });
      const pageInfo = await page.evaluate(() => ({
        title: document.title,
        url: window.location.href,
        heading: document.querySelector('.oxd-topbar-header-title')?.textContent?.trim(),
        buttons: Array.from(document.querySelectorAll('button.oxd-button')).map(b => b.textContent?.trim()),
        inputs: document.querySelectorAll('input').length,
        tables: document.querySelectorAll('.oxd-table').length,
      }));
      results.push({ menu: item.text, ...pageInfo });
      console.log(`Visited: ${item.text} ✓`);
    } catch (err) {
      console.log(`Failed: ${item.text}: ${err.message}`);
    }
  }

  // 5. Save exploration data
  const report = {
    loginPage: loginFields,
    menuItems,
    pages: results,
  };
  fs.writeFileSync(path.join(outDir, 'exploration.json'), JSON.stringify(report, null, 2));
  console.log('\n=== EXPLORATION DONE ===');
  console.log(`Pages: ${results.length}`);
  console.log(`Screenshots: ${fs.readdirSync(outDir).filter(f => f.endsWith('.png')).length}`);
  console.log(`Report: exploration/exploration.json`);

  // 6. Print page summary
  for (const p of results) {
    console.log(`\n${p.menu} | heading: ${p.heading} | inputs: ${p.inputs} | tables: ${p.tables}`);
  }

  await browser.close();
})();