const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const outDir = path.join(__dirname, '..', 'exploration', 'claim');
  fs.mkdirSync(outDir, { recursive: true });

  const log = [];

  async function dumpPage(label) {
    await page.waitForTimeout(1500);
    const state = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], .oxd-button, .oxd-icon-button'))
        .map(b => ({
          text: b.textContent?.trim() || '',
          class: b.className?.slice(0, 80),
          visible: b.offsetParent !== null,
          tag: b.tagName,
          type: b.type || '',
        })).filter(b => b.visible);

      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'))
        .map(i => ({
          tag: i.tagName,
          type: i.type || '',
          name: i.name || '',
          placeholder: i.placeholder || '',
          id: i.id || '',
          visible: i.offsetParent !== null,
        })).filter(i => i.visible);

      const links = Array.from(document.querySelectorAll('a'))
        .map(a => ({
          text: a.textContent?.trim() || '',
          href: a.getAttribute('href') || '',
          visible: a.offsetParent !== null,
        })).filter(l => l.visible && l.text);

      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .oxd-topbar-header-title, .oxd-text--h6, .oxd-text--p'))
        .map(h => ({
          tag: h.tagName,
          text: h.textContent?.trim() || '',
          class: h.className?.slice(0, 60),
          visible: h.offsetParent !== null,
        })).filter(h => h.visible && h.text);

      const tables = Array.from(document.querySelectorAll('.oxd-table'))
        .map(t => ({
          class: t.className?.slice(0, 80),
          rows: t.querySelectorAll('.oxd-table-card').length,
          headerText: Array.from(t.querySelectorAll('.oxd-table-header-cell')).map(c => c.textContent?.trim()).filter(Boolean),
          visible: t.offsetParent !== null,
        })).filter(t => t.visible);

      const dropdowns = Array.from(document.querySelectorAll('.oxd-select-wrapper'))
        .map(d => ({
          options: Array.from(d.querySelectorAll('.oxd-select-option')).map(o => o.textContent?.trim()).filter(Boolean),
          visible: d.offsetParent !== null,
        })).filter(d => d.visible && d.options.length > 0);

      const tabs = Array.from(document.querySelectorAll('.oxd-topbar-body-nav-tab-item'))
        .map(t => ({
          text: t.textContent?.trim() || '',
          selected: t.classList.contains('--visited') ? 'selected' : '',
          visible: t.offsetParent !== null,
        })).filter(t => t.visible && t.text);

      const labels = Array.from(document.querySelectorAll('.oxd-label, .oxd-text--label, label.oxd-label'))
        .map(l => ({
          text: l.textContent?.trim() || '',
          visible: l.offsetParent !== null,
        })).filter(l => l.visible && l.text);

      return {
        url: window.location.href,
        buttons: buttons.slice(0, 40),
        inputs: inputs.slice(0, 40),
        headings: headings.slice(0, 30),
        tables: tables.slice(0, 5),
        dropdowns: dropdowns.slice(0, 10),
        tabs: tabs.slice(0, 10),
        labels: labels.slice(0, 30),
      };
    });

    await page.screenshot({ path: path.join(outDir, `${label.replace(/[^a-z0-9-]/gi, '-')}.png`), fullPage: true });
    log.push({ label, ...state });
    console.log(`\n=== ${label} ===`);
    console.log(`URL: ${state.url}`);
    console.log(`Labels: ${state.labels.map(l => l.text).join(', ')}`);
    console.log(`Buttons: ${state.buttons.map(b => b.text).filter(Boolean).join(', ')}`);
    console.log(`Inputs: ${state.inputs.map(i => `${i.placeholder || i.name || i.id}`).filter(Boolean).join(', ')}`);
    console.log(`Tables: ${state.tables.length ? state.tables.map(t => `${t.headerText.join(', ')}`).join(' | ') : 'none'}`);
    console.log(`Dropdowns: ${state.dropdowns.map(d => `[${d.options.join(', ')}]`).join(' | ')}`);
    console.log(`Tabs: ${state.tabs.map(t => `${t.text}${t.selected ? ' ✓' : ''}`).join(', ')}`);
    return state;
  }

  // 1. Login
  await page.goto('http://localhost:8080/web/index.php/auth/login');
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await dumpPage('01-login-page');

  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'Orangehrm@2026');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.oxd-topbar-header-title', { timeout: 15000 });
  console.log('\nLogged in ✓');

  // 2. Claim pages to visit
  const pages = {
    '02-claim-viewAssignClaim': '/web/index.php/claim/viewAssignClaim',
    '03-claim-submitClaim': '/web/index.php/claim/submitClaim',
    '04-claim-viewMyClaims': '/web/index.php/claim/viewMyClaims',
    '05-claim-viewEmployeeClaims': '/web/index.php/claim/viewEmployeeClaims',
    '06-claim-viewClaim': '/web/index.php/claim/viewClaim',
  };

  for (const [label, url] of Object.entries(pages)) {
    await page.goto(`http://localhost:8080${url}`);
    await dumpPage(label);
  }

  // 3. Deep dive: Submit Claim form — try to open dropdowns
  await page.goto('http://localhost:8080/web/index.php/claim/submitClaim');
  await page.waitForTimeout(1000);

  // Click each dropdown to reveal options
  const selectWrappers = page.locator('.oxd-select-wrapper');
  const selectCount = await selectWrappers.count();
  console.log(`\nSubmit Claim form has ${selectCount} select wrappers`);

  for (let i = 0; i < selectCount; i++) {
    await selectWrappers.nth(i).click();
    await page.waitForTimeout(800);
    const options = await page.locator('.oxd-select-option').allTextContents();
    console.log(`Select ${i} options: [${options.join(', ')}]`);
    // Click first option to select it
    if (options.length > 0) {
      await page.locator('.oxd-select-option').first().click();
      await page.waitForTimeout(300);
    }
  }

  // Check for file upload
  const fileUpload = page.locator('.oxd-file-input-div, input[type="file"]');
  if (await fileUpload.isVisible({ timeout: 1000 }).catch(() => false)) {
    console.log('File upload field present');
  }

  await dumpPage('07-submit-claim-form-filled');

  // 4. Deep dive: Assign Claim search with autocomplete
  await page.goto('http://localhost:8080/web/index.php/claim/viewAssignClaim');
  await page.waitForTimeout(1000);

  // Explore search form
  const searchFormInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.oxd-form-row .oxd-input, .oxd-form-row input, .oxd-form-row .oxd-select-wrapper')).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      placeholder: el.placeholder || '',
      class: el.className?.slice(0, 60),
    }));
  });
  console.log('\nSearch form elements:', JSON.stringify(searchFormInputs, null, 2));

  // Try clicking a dropdown in the search form
  const searchSelects = page.locator('.oxd-form .oxd-select-wrapper');
  const searchSelectCount = await searchSelects.count();
  console.log(`Search form dropdowns: ${searchSelectCount}`);

  for (let i = 0; i < searchSelectCount; i++) {
    await searchSelects.nth(i).click();
    await page.waitForTimeout(600);
    const opts = await page.locator('.oxd-select-option').allTextContents();
    console.log(`Search select ${i}: [${opts.join(', ')}]`);
    await page.locator('.oxd-select-option').first().click();
    await page.waitForTimeout(300);
  }

  await dumpPage('08-assign-claim-search-filled');

  // 5. Try "Assign Claim" primary button
  const assignBtn = page.locator('button.oxd-button--secondary:has-text("Assign Claim")');
  if (await assignBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await assignBtn.click();
    await page.waitForTimeout(1500);
    await dumpPage('09-assign-claim-form-modal');

    // Check if a form appeared (might be a new page or modal)
    const formVisible = await page.locator('.oxd-form').isVisible({ timeout: 2000 }).catch(() => false);
    if (formVisible) {
      const formLabels = await page.locator('.oxd-label').allTextContents();
      console.log('Assign form labels:', formLabels);

      // Try the autocomplete
      const hintInput = page.locator('input[placeholder="Type for hints..."]');
      if (await hintInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await hintInput.click();
        await hintInput.fill('a');
        await page.waitForTimeout(2000);
        if (await page.locator('.oxd-autocomplete-dropdown').isVisible({ timeout: 3000 }).catch(() => false)) {
          const autocompleteOptions = await page.locator('.oxd-autocomplete-option').allTextContents();
          console.log('Employee autocomplete options:', autocompleteOptions.slice(0, 5));
          if (autocompleteOptions.length > 0) {
            await page.locator('.oxd-autocomplete-option').first().click();
            await page.waitForTimeout(500);
          }
        }
      }

      // Open dropdowns
      const formSelects = page.locator('.oxd-form .oxd-select-wrapper');
      const formSelectCount = await formSelects.count();
      for (let i = 0; i < formSelectCount; i++) {
        await formSelects.nth(i).click();
        await page.waitForTimeout(600);
        const opts = await page.locator('.oxd-select-option').allTextContents();
        console.log(`Form select ${i}: [${opts.join(', ')}]`);
        if (opts.length > 0) {
          await page.locator('.oxd-select-option').first().click();
          await page.waitForTimeout(300);
        }
      }

      await dumpPage('10-assign-claim-form-filled');
    }
  }

  // 6. View employee claims — check table actions
  await page.goto('http://localhost:8080/web/index.php/claim/viewEmployeeClaims');
  await page.waitForTimeout(1000);
  await dumpPage('11-employee-claims-detailed');

  // Check for any action buttons in the table
  const actionBtns = page.locator('.oxd-table-cell-actions button, .oxd-icon-button');
  const actionCount = await actionBtns.count().catch(() => 0);
  console.log(`Table action buttons: ${actionCount}`);

  if (actionCount > 0) {
    await actionBtns.first().click();
    await page.waitForTimeout(1000);
    await dumpPage('12-employee-claims-row-action');
  }

  // 7. View My Claims with search
  await page.goto('http://localhost:8080/web/index.php/claim/viewMyClaims');
  await page.waitForTimeout(1000);

  // Check table structure
  const myClaimsTable = await page.evaluate(() => {
    const table = document.querySelector('.oxd-table');
    if (!table) return null;
    return {
      headerCells: Array.from(table.querySelectorAll('.oxd-table-header-cell')).map(c => c.textContent?.trim()),
      rowCount: table.querySelectorAll('.oxd-table-card').length,
    };
  });
  console.log('\nMy Claims table:', JSON.stringify(myClaimsTable, null, 2));

  await dumpPage('13-my-claims-detailed');

  // 8. Summary
  console.log('\n========== EXPLORATION SUMMARY ==========');
  for (const entry of log) {
    console.log(`${entry.label}: ${entry.headings?.map(h => h.text).join(' | ') || ''} | ${entry.buttons?.length || 0} btns, ${entry.inputs?.length || 0} fields, ${entry.tables?.length || 0} tables`);
  }

  // Save full exploration data
  fs.writeFileSync(path.join(outDir, 'claim-exploration.json'), JSON.stringify(log, null, 2));
  console.log(`\nDone. Data in ${path.join(outDir, 'claim-exploration.json')}`);

  await browser.close();
})();
