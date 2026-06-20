import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'https://opensource-demo.orangehrmlive.com';
const OUT = path.join(__dirname, '..', 'exploration', 'maintenance');
const CREDS = { username: 'Admin', password: 'admin123' };

interface PageCapture {
  url: string;
  title: string;
  heading: string | null;
  buttons: { text: string | null; type: string }[];
  inputs: { name: string; type: string; placeholder: string; id: string }[];
  selects: { name: string; id: string }[];
  labels: { text: string | null; htmlFor: string }[];
  tables: { headers: string[]; rowCount: number }[];
  links: { text: string | null; href: string | null }[];
}

async function capture(page: PageCapture): Promise<void> {
  // no-op — returns via evaluate
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/web/index.php/auth/login`);
  await page.waitForSelector('.orangehrm-login-branding', { timeout: 15000 });

  // Login
  await page.fill('input[name="username"]', CREDS.username);
  await page.fill('input[name="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.oxd-topbar-header-title', { timeout: 10000 });
  console.log('Logged in ✓');

  // Step 1: Navigate to Maintenance — expect password access screen
  console.log('\n=== Step 1: Navigate to Maintenance (password screen) ===');
  await page.goto(`${BASE}/web/index.php/maintenance/purgeEmployee`);
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(OUT, '01-password-screen.png'), fullPath: true });

  const pwScreen = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    heading: document.querySelector('.oxd-topbar-header-title')?.textContent?.trim() || null,
    buttons: Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim() || null,
      type: b.type,
    })),
    inputs: Array.from(document.querySelectorAll('input')).map(i => ({
      name: i.name,
      type: i.type,
      placeholder: i.placeholder,
      id: i.id,
    })),
    labels: Array.from(document.querySelectorAll('label')).map(l => ({
      text: l.textContent?.trim() || null,
      htmlFor: l.htmlFor,
    })),
    selects: Array.from(document.querySelectorAll('select')).map(s => ({
      name: s.name,
      id: s.id,
    })),
    links: Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.textContent?.trim() || null,
      href: a.getAttribute('href'),
    })),
    form: document.querySelector('.oxd-form')?.outerHTML?.slice(0, 500) || null,
  }));
  console.log('Password screen captured:', JSON.stringify(pwScreen, null, 2));

  // Step 2: Enter password and confirm
  console.log('\n=== Step 2: Enter admin password ===');
  const pwInput = page.locator('input[type="password"]');
  const pwInputCount = await pwInput.count();
  console.log(`Password inputs found: ${pwInputCount}`);

  if (pwInputCount > 0) {
    await pwInput.fill(CREDS.password);
    // Find confirm button (type=submit)
    const confirmBtn = page.locator('button[type="submit"]');
    console.log(`Confirm button found: ${await confirmBtn.count()}`);
    await confirmBtn.click();
    await page.waitForTimeout(3000);
    console.log('Password submitted ✓');

    await page.screenshot({ path: path.join(OUT, '02-maintenance-dashboard.png'), fullPath: true });

    // Step 3: Capture maintenance dashboard
    const maintDashboard = await page.evaluate(() => ({
      url: window.location.href,
      title: document.title,
      heading: document.querySelector('.oxd-topbar-header-title')?.textContent?.trim() || null,
      buttons: Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent?.trim() || null,
        type: b.type,
      })),
      inputs: Array.from(document.querySelectorAll('input')).map(i => ({
        name: i.name,
        type: i.type,
        placeholder: i.placeholder,
        id: i.id,
      })),
      links: Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent?.trim() || null,
        href: a.getAttribute('href'),
      })),
      cards: Array.from(document.querySelectorAll('.oxd-sheet')).map(c => ({
        text: c.textContent?.trim()?.slice(0, 200) || null,
      })),
      mainMenuItems: Array.from(document.querySelectorAll('.oxd-main-menu-item')).map(m => ({
        text: m.textContent?.trim() || null,
        href: m.getAttribute('href'),
      })),
    }));
    console.log('\nMaintenance dashboard captured:', JSON.stringify(maintDashboard, null, 2));

    // Step 4: Click Purge Records if available
    const purgeLink = page.locator('a:has-text("Purge Records")');
    if (await purgeLink.count() > 0) {
      console.log('\n=== Step 4: Click Purge Records ===');
      await purgeLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(OUT, '03-purge-records.png'), fullPath: true });

      const purgeScreen = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        heading: document.querySelector('.oxd-topbar-header-title')?.textContent?.trim() || null,
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.textContent?.trim() || null,
          type: b.type,
        })),
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({
          name: i.name,
          type: i.type,
          placeholder: i.placeholder,
          id: i.id,
        })),
        labels: Array.from(document.querySelectorAll('label')).map(l => ({
          text: l.textContent?.trim() || null,
          htmlFor: l.htmlFor,
        })),
        tables: Array.from(document.querySelectorAll('.oxd-table')).map(t => ({
          headers: Array.from(t.querySelectorAll('.oxd-table-header th')).map(h => h.textContent?.trim() || ''),
          rowCount: t.querySelectorAll('.oxd-table-body .oxd-table-card').length,
        })),
        selects: Array.from(document.querySelectorAll('select')).map(s => ({
          name: s.name,
          id: s.id,
        })),
      }));
      console.log('Purge Records screen captured:', JSON.stringify(purgeScreen, null, 2));
    }

    // Step 5: Check Access Records
    const accessLink = page.locator('a:has-text("Access Records")');
    if (await accessLink.count() > 0) {
      console.log('\n=== Step 5: Click Access Records ===');
      // navigate back to maintenance dashboard
      await page.goto(`${BASE}/web/index.php/maintenance/purgeEmployee`);
      await page.waitForTimeout(2000);
      await accessLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(OUT, '04-access-records.png'), fullPath: true });

      const accessScreen = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        heading: document.querySelector('.oxd-topbar-header-title')?.textContent?.trim() || null,
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.textContent?.trim() || null,
          type: b.type,
        })),
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({
          name: i.name,
          type: i.type,
          placeholder: i.placeholder,
          id: i.id,
        })),
      }));
      console.log('Access Records screen captured:', JSON.stringify(accessScreen, null, 2));
    }

    // Step 6: Navigate back to purge page and capture search
    console.log('\n=== Step 6: Navigate to Purge Employee Records ===');
    await page.goto(`${BASE}/web/index.php/maintenance/purgeEmployee`);
    await page.waitForTimeout(2000);

    // Try to find any sub-navigation or purge-specific forms
    const purgeForms = await page.evaluate(() => ({
      url: window.location.href,
      heading: document.querySelector('.oxd-topbar-header-title')?.textContent?.trim() || null,
      sideNav: Array.from(document.querySelectorAll('.oxd-sidepanel-body a, .oxd-topbar-body-nav a')).map(a => ({
        text: a.textContent?.trim() || null,
        href: a.getAttribute('href'),
      })),
      topBarNav: Array.from(document.querySelectorAll('.oxd-topbar-body-nav-tab-item')).map(t => ({
        text: t.textContent?.trim() || null,
        href: t.getAttribute('href'),
      })),
      forms: document.querySelectorAll('.oxd-form').length,
      selects: Array.from(document.querySelectorAll('select')).map(s => ({
        options: Array.from(s.querySelectorAll('option')).map(o => ({ value: o.value, text: o.textContent?.trim() })),
      })),
    }));
    console.log('Purge navigation:', JSON.stringify(purgeForms, null, 2));

    // Step 7: Try to navigate to each purge sub-tab
    console.log('\n=== Step 7: Purge sub-tabs ===');
    const tabs = page.locator('.oxd-topbar-body-nav-tab-item');
    const tabCount = await tabs.count();
    console.log(`Found ${tabCount} sub-tabs`);

    for (let i = 0; i < tabCount; i++) {
      const tabText = await tabs.nth(i).textContent();
      console.log(`Tab ${i}: "${tabText?.trim()}"`);
      await tabs.nth(i).click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUT, `05-purge-tab-${i}-${tabText?.trim().replace(/\s+/g, '-')}.png`), fullPath: true });
    }
  }

  // Save full report
  const report = {
    passwordScreen: pwScreen,
  };
  fs.writeFileSync(path.join(OUT, 'exploration.json'), JSON.stringify(report, null, 2));
  console.log(`\n=== EXPLORATION DONE ===`);
  console.log(`Output: ${OUT}/`);

  await browser.close();
})();
