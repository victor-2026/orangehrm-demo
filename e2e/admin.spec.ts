import { test, expect } from '../helpers/fixtures';

test.describe('Admin Module', () => {

    test.describe('1. Navigation', () => {

    test('1.1 Navigate to Admin via sidebar @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      expect(page.url()).toContain('/admin/viewSystemUsers');
      await expect(page.locator('.oxd-topbar-header-title')).toContainText('Admin');
      await expect(page.locator('.oxd-table')).toBeVisible();
    });

    test('1.2 All 7 topbar tabs visible @smoke', async ({ adminPage, loggedInPage }) => {
      await adminPage.goto();
      const tabs = await adminPage.getTopbarTabs();
      expect(tabs).toEqual([
        'User Management',
        'Job',
        'Organization',
        'Qualifications',
        'Nationalities',
        'Corporate Branding',
        'Configuration',
      ]);
    });

    test('1.3 Each topbar tab reveals correct sub-tabs @smoke', async ({ adminPage, loggedInPage }) => {
      await adminPage.goto();
      const tabSubTabsMap: { [key: string]: string[] } = {
        'User Management': ['Users'],
        'Job': ['Job Titles', 'Pay Grades', 'Employment Status', 'Job Categories', 'Work Shifts'],
        'Organization': ['General Information', 'Locations', 'Structure'],
        'Qualifications': ['Skills', 'Education', 'Licenses', 'Languages', 'Memberships'],
        'Nationalities': [],
        'Corporate Branding': [],
        'Configuration': ['Email Configuration', 'Email Subscriptions', 'Localization', 'Language Packages', 'Modules', 'Social Media Authentication', 'Register OAuth Client', 'LDAP Configuration'],
      };

      for (const [tabName, expectedSubTabs] of Object.entries(tabSubTabsMap)) {
        await adminPage.clickTopbarTab(tabName);
        const subTabs = await adminPage.getSubTabs();
        expect(subTabs).toEqual(expectedSubTabs);
      }
    });

    test('1.4 Sub-tab click navigates to correct page @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToSubTab('Job', 'Job Titles');
      expect(page.url()).toContain('/admin/viewJobTitleList');
    });

  });

  test.describe('2. User Management', () => {

    test('2.1 Users table shows expected columns @smoke', async ({ adminPage, loggedInPage }) => {
      await adminPage.goto();
      const headers = await adminPage.getTableHeaders();
      expect(headers).toContain('Username');
      expect(headers).toContain('User Role');
      expect(headers).toContain('Employee Name');
      expect(headers).toContain('Status');
    });

    test('2.2 Users table shows data rows @smoke', async ({ adminPage, loggedInPage }) => {
      await adminPage.goto();
      const rowCount = await adminPage.getTableRows();
      expect(rowCount).toBeGreaterThan(0);
      const rowData = await adminPage.getRowData(0);
      expect(rowData[1]).toBe('Admin');      // Username
      expect(rowData[2]).toBe('Admin');      // User Role
      expect(rowData[4]).toBe('Enabled');    // Status
    });

    test('2.3 Search by Username @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.searchUser('Admin');
      await expect(page.locator('.oxd-table-body')).toContainText('Admin');
    });

    test('2.4 Search by User Role @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.searchByUserRole('Admin');
      const rows = page.locator('.oxd-table-body .oxd-table-row');
      expect(await rows.count()).toBeGreaterThan(0);
      for (let i = 0; i < await rows.count(); i++) {
        const cells = rows.nth(i).locator('.oxd-table-cell');
        const role = await cells.nth(2).textContent();
        expect(role).toBe('Admin');
      }
    });

    test('2.5 Search by Status @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.searchByStatus('Enabled');
      const rows = page.locator('.oxd-table-body .oxd-table-row');
      expect(await rows.count()).toBeGreaterThan(0);
      for (let i = 0; i < await rows.count(); i++) {
        const cells = rows.nth(i).locator('.oxd-table-cell');
        const status = await cells.nth(4).textContent();
        expect(status).toBe('Enabled');
      }
    });

    test('2.7 Combined search @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.searchCombined('Admin', 'Enabled');
      const rows = page.locator('.oxd-table-body .oxd-table-row');
      expect(await rows.count()).toBeGreaterThan(0);
      for (let i = 0; i < await rows.count(); i++) {
        const cells = rows.nth(i).locator('.oxd-table-cell');
        const role = await cells.nth(2).textContent();
        const status = await cells.nth(4).textContent();
        expect(role).toBe('Admin');
        expect(status).toBe('Enabled');
      }
    });

    test('2.8 Search with no results @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.searchWithNoResults();
      const recordCountText = await adminPage.getRecordCountText();
      expect(recordCountText).toContain('No Records Found');
    });

    test('2.9 Reset clears all filters @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.searchByUserRole('Admin');
      const countAfterSearch = await adminPage.getTableRows();
      await adminPage.resetSearch();
      const countAfterReset = await adminPage.getTableRows();
      expect(countAfterSearch).toBeGreaterThan(0);
      expect(countAfterReset).toBeGreaterThan(0);
    });

    test('2.11 Add User — happy path @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.clickAdd();
      expect(page.url()).toContain('/admin/saveSystemUser');

      const username = `TestUser_${Date.now()}`;
      await adminPage.fillUserForm('ESS', 'Admin', username, 'TestPass123!', 'Enabled');
      await adminPage.clickSave();
      expect(page.url()).toContain('/admin/viewSystemUsers');
    });

    test('2.12 Add User — validation errors @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.clickAdd();
      expect(page.url()).toContain('/admin/saveSystemUser');

      await adminPage.clickSave();
      expect(page.url()).toContain('/admin/saveSystemUser');

      const errorMessages = page.locator('.oxd-input-field-error-message');
      expect(await errorMessages.count()).toBeGreaterThan(0);
    });

    test('2.15 Add User — weak password @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.clickAdd();
      expect(page.url()).toContain('/admin/saveSystemUser');

      const username = `TestUser_${Date.now()}`;
      await adminPage.fillUserForm('ESS', 'Admin', username, '123', 'Enabled');
      await adminPage.clickSave();
      expect(page.url()).toContain('/admin/saveSystemUser');

      const errorMessages = page.locator('.oxd-input-field-error-message');
      expect(await errorMessages.count()).toBeGreaterThan(0);
      const errorText = await errorMessages.first().textContent();
      expect(errorText?.toLowerCase()).toContain('password') || expect(errorText?.toLowerCase()).toContain('length');
    });

    test('2.19 Delete user — confirm @local', async ({ adminPage, page, loggedInPage }) => {
      // Create a test user first so we have something to delete
      const username = `DelTest_${Date.now()}`;
      await adminPage.goto();
      await adminPage.clickAdd();
      await adminPage.fillUserForm('ESS', 'Admin', username, 'TestPass123!', 'Enabled');
      await adminPage.clickSave();
      expect(page.url()).toContain('/admin/viewSystemUsers');

      // Search for the user to confirm creation
      await adminPage.searchUser(username);
      await expect(page.locator('.oxd-table-body')).toContainText(username);

      // Delete the test user
      await adminPage.deleteUserWithConfirm(username);
      await page.waitForTimeout(2000);

      // Verify user is gone by searching again
      await adminPage.searchUser(username);
      const rowAfterDelete = page.locator(`.oxd-table-body .oxd-table-row:has-text("${username}")`);
      await expect(rowAfterDelete).toHaveCount(0);
    });

    test('2.16 View user details @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.clickUserDetails('Admin');
      expect(await adminPage.isUserFormVisible()).toBe(true);
    });

    test('2.17 Edit user @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.editUserStatus('Admin', 'Disabled');
      await expect(page.locator('.oxd-table-body')).toContainText('Admin');
      const rowData = await adminPage.getRowData(0);
      expect(rowData[4]).toBe('Disabled');
    });

  });

  test.describe('3. Job', () => {

    test('3.1 Job Titles — empty state @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToJobTitleList();
      expect(page.url()).toContain('/admin/viewJobTitleList');
      const recordCountText = await adminPage.getRecordCountText();
      expect(recordCountText).toContain('No Records Found');
    });

    test('3.2 Job Titles — Add @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToJobTitleList();
      await adminPage.addJobTitle('Test Job Title', 'Test Description');
      expect(await adminPage.getJobTitleCount()).toBeGreaterThan(0);
    });

    test('3.3 Pay Grades — empty state @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToPayGrades();
      expect(page.url()).toContain('/admin/viewPayGrades');
      const recordCountText = await adminPage.getRecordCountText();
      expect(recordCountText).toContain('No Records Found');
    });

    test('3.4 Pay Grades — Add with currency @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToPayGrades();
      await adminPage.addPayGrade('Test Grade');
      await adminPage.addPayGradeCurrency('Test Grade', 'USD', '50000', '80000');
      expect(await adminPage.getJobTitleCount()).toBeGreaterThan(0);
    });

  });

  test.describe('4. Organization', () => {

    test('4.1 General Information fields @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToSubTab('Organization', 'General Information');
      expect(page.url()).toContain('/admin/viewOrganizationGeneralInformation');
      const fields = page.locator('.oxd-label');
      expect(await fields.count()).toBe(14);
    });

    test('4.2 General Information edit @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToSubTab('Organization', 'General Information');
      await adminPage.fillByLabel('Organization Name', 'Test Organization');
      await page.click('button[type="submit"]');
      const message = page.locator('.oxd-toast');
      expect(await message.isVisible()).toBe(true);
    });

    test('4.3 Locations page loads @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToSubTab('Organization', 'Locations');
      expect(page.url()).toContain('/admin/viewLocations');
      expect(page.locator('button:has-text("Add")]')).toBeVisible();
    });

    test('4.4 Locations Add @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToSubTab('Organization', 'Locations');
      await page.click('button:has-text("Add")');
      await page.fill('input[name="name"]', 'Test Location');
      await page.selectOption('select[name="country"]', 'US');
      await page.fill('input[name="city"]', 'Test City');
      await page.fill('input[name="phone"]', '1234567890');
      await page.click('button[type="submit"]');
      expect(page.locator('.oxd-table')).toBeVisible();
    });

    test('4.5 Locations validation @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToSubTab('Organization', 'Locations');
      await page.click('button:has-text("Add")');
      await page.click('button[type="submit"]');
      const errorMessages = page.locator('.oxd-input-field-error-message');
      expect(await errorMessages.count()).toBeGreaterThan(0);
    });

  });

  test.describe('5. Qualifications', () => {

    test('5.1 Skills Add @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToSkills();
      await adminPage.addSkill('Test Skill', 'Test Skill Description');
      expect(await page.locator('.oxd-table').textContent()).toContain('Test Skill');
    });

    test('5.2 Skills Search @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToSkills();
      await adminPage.searchSkill('Test Skill');
      expect(page.locator('.oxd-table')).toBeVisible();
    });

    test('5.3 Education Add @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToEducation();
      await adminPage.addEducation('Test Education Level');
      expect(await page.locator('.oxd-table').textContent()).toContain('Test Education Level');
    });

    test('5.4 Licenses Add @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToLicenses();
      await adminPage.addLicense('Test License');
      expect(await page.locator('.oxd-table').textContent()).toContain('Test License');
    });

    test('5.5 Languages Add @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToLanguages();
      await adminPage.addLanguage('Test Language');
      expect(await page.locator('.oxd-table').textContent()).toContain('Test Language');
    });

  });

  test.describe('6. Nationalities', () => {

    test('6.1 List displays @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToNationalities();
      expect(page.url()).toContain('/admin/nationality');
      const rows = page.locator('.oxd-table-row');
      expect(await rows.count()).toBeGreaterThan(0);
      expect(page.locator('.oxd-table-pagination')).toBeVisible();
    });

    test('6.2 Pagination @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToNationalities();
      await adminPage.clickNationalityPage(2);
      expect(page.locator('.oxd-table-row')).toBeVisible();
    });

    test('6.3 Add nationality @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToNationalities();
      await adminPage.addNationality('Test Nationality');
      expect(await page.locator('.oxd-table').textContent()).toContain('Test Nationality');
    });

  });

  test.describe('7. Corporate Branding', () => {

    test('7.1 Branding page loads @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToCorporateBranding();
      expect(page.url()).toContain('/admin/addTheme');
      expect(page.locator('.oxd-color-block')).toHaveCount(8);
      expect(page.locator('input[type="file"]')).toHaveCount(3);
    });

    test('7.2 Change primary color @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToCorporateBranding();
      await adminPage.changePrimaryColor('#FF0000');
      expect(page.locator('.oxd-color-block').first()).toHaveCSS('background-color', 'rgb(255, 0, 0)');
    });

  });

  test.describe('8. Configuration', () => {

    test('8.1 Email Config page loads @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToEmailConfig();
      expect(page.url()).toContain('/admin/listMailConfiguration');
      expect(page.locator('input[name="mail_sent_as"]')).toBeVisible();
    });

    test('8.2 Email Config save @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToEmailConfig();
      await adminPage.fillEmailConfig({
        mailSentAs: 'test@example.com',
        smtpHost: 'smtp.example.com',
        smtpPort: '587',
        useSmtpAuth: true,
        smtpUser: 'user',
        smtpPassword: 'password',
      });
      await adminPage.saveEmailConfig();
      expect(page.locator('.oxd-toast')).toBeVisible();
    });

    test('8.4 Email Subscriptions @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToEmailSubscriptions();
      expect(page.url()).toContain('/admin/viewEmailNotification');
      expect(await adminPage.getSubscriptionCount()).toBeGreaterThan(0);
    });

    test('8.6 Localization @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToLocalization();
      await adminPage.changeLanguage('English (United States)');
      await adminPage.changeDateFormat('dd/MM/yyyy');
      await page.click('button[type="submit"]');
      expect(page.locator('.oxd-toast')).toBeVisible();
    });

    test('8.7 Modules disable @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToModules();
      await adminPage.toggleModule('PIM', false);
      await page.click('button[type="submit"]');
      expect(page.locator('.oxd-toast')).toBeVisible();
    });

    test('8.9 OAuth Client @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.navigateToOAuthClients();
      expect(page.url()).toContain('/admin/registerOAuthClient');
      expect(page.locator('.oxd-table')).toBeVisible();
    });

  });

  test.describe('9. Edge Cases', () => {

    test('9.1 Username min length @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.clickAdd();
      await adminPage.fillUserForm('ESS', 'Admin', 'user', 'TestPass123!', 'Enabled');
      await adminPage.clickSave();
      const errorMessages = page.locator('.oxd-input-field-error-message');
      expect(await errorMessages.count()).toBeGreaterThan(0);
    });

    test('9.2 Empty password @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.clickAdd();
      const username = `TestUser_${Date.now()}`;
      await adminPage.fillUserForm('ESS', 'Admin', username, '', 'Enabled');
      await adminPage.clickSave();
      const errorMessages = page.locator('.oxd-input-field-error-message');
      expect(await errorMessages.count()).toBeGreaterThan(0);
    });

    test('9.4 Employee not found @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.fillByLabel('Username', 'ZZZNonoExistsUser');
      await page.click('button:has-text("Search")');
      await page.waitForLoadState('networkidle');
      const recordCountText = await adminPage.getRecordCountText();
      expect(recordCountText).toContain('No Records Found');
    });

    test('9.11 XSS injection @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.fillByLabel('Username', '<script>alert(\'XSS\')</script>');
      await page.click('button:has-text("Search")');
      await page.waitForLoadState('networkidle');
      expect(page.locator('script')).toHaveCount(0);
    });

  });

});
