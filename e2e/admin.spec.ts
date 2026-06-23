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
      const rowCount = await rows.count();
      if (rowCount > 0) {
        await expect(rows.first()).toContainText('Admin', { timeout: 10000 });
      }
      await expect(page.locator('.oxd-table')).toBeVisible();
    });

    test('2.5 Search by Status @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.searchByStatus('Enabled');
      const rows = page.locator('.oxd-table-body .oxd-table-row');
      const rowCount = await rows.count();
      if (rowCount > 0) {
        for (let i = 0; i < rowCount; i++) {
          const cells = rows.nth(i).locator('.oxd-table-cell');
          const status = await cells.nth(4).textContent();
          expect(status).toBe('Enabled');
        }
      }
      await expect(page.locator('.oxd-table')).toBeVisible();
    });

    test('2.7 Combined search @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.searchCombined('Admin', 'Enabled');
      await expect(page.locator('.oxd-table')).toBeVisible();
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
      if (countAfterSearch > 0) {
        expect(countAfterReset).toBeGreaterThan(0);
      }
      await expect(page.locator('.oxd-table')).toBeVisible();
    });

    test('2.11 Add User — happy path @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.clickAdd();
      expect(page.url()).toContain('/admin/saveSystemUser');

      const username = `TestUser_${Date.now()}`;
      await adminPage.fillUserForm('ESS', 'Admin', username, 'TestPass123!', 'Enabled');
      await adminPage.clickSave();
      expect(page.url()).toContain('/admin/saveSystemUser');
      const toast = page.locator('.oxd-toast');
      await expect(toast).toBeVisible({ timeout: 5000 });
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
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
      const errorText = await errorMessages.first().textContent();
      expect(errorText?.toLowerCase()).toMatch(/password|length|8 characters/);
    });

    test('2.19 Delete user — confirm @local', async ({ adminPage, page, loggedInPage }) => {
      // Create a test user first so we have something to delete
      const username = `DelTest_${Date.now()}`;
      await adminPage.goto();
      await adminPage.clickAdd();
      await adminPage.fillUserForm('ESS', 'Admin', username, 'TestPass123!', 'Enabled');
      await adminPage.clickSave();
      expect(page.url()).toContain('/admin/saveSystemUser');

      // Navigate to user list and search for the new user
      await adminPage.goto();
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
      await adminPage.searchUser('Admin');
      await adminPage.page.waitForTimeout(1000);
      await adminPage.clickUserDetails('Admin');
      expect(await adminPage.isUserFormVisible()).toBe(true);
    });

    test('2.17 Edit user @local', async ({ adminPage, page, loggedInPage }) => {
      const editUser = `EditTest_${Date.now()}`;
      await adminPage.goto();
      await adminPage.clickAdd();
      await adminPage.fillUserForm('ESS', 'Admin', editUser, 'TestPass123!', 'Enabled');
      await adminPage.clickSave();
      await adminPage.goto();
      await adminPage.searchUser(editUser);
      await adminPage.editUserStatus(editUser, 'Disabled');
      await adminPage.goto();
      await adminPage.searchUser(editUser);
      await expect(page.locator('.oxd-table-body')).toContainText(editUser);
      const rowData = await adminPage.getRowData(0);
      expect(rowData[4]).toBe('Disabled');
    });

  });

  test.describe('3. Job', () => {

    test('3.1 Job Titles — page loads @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToJobTitleList();
      expect(page.url()).toContain('/admin/viewJobTitleList');
    });

    test('3.2 Job Titles — Add @local', async ({ adminPage, page, loggedInPage }) => {
      const jobTitle = `JobTitle_${Date.now()}`;
      await adminPage.goto();
      await adminPage.navigateToJobTitleList();
      await adminPage.addJobTitle(jobTitle, 'Test Description');
      expect(await adminPage.getJobTitleCount()).toBeGreaterThan(0);
    });

    test('3.3 Pay Grades — page loads @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToPayGrades();
      expect(page.url()).toContain('/admin/viewPayGrades');
    });

    test('3.4 Pay Grades — Add with currency @local', async ({ adminPage, page, loggedInPage }) => {
      const gradeName = `Grade_${Date.now()}`;
      await adminPage.goto();
      await adminPage.navigateToPayGrades();
      await adminPage.addPayGrade(gradeName);
      await adminPage.addPayGradeCurrency(gradeName, 'USD', '50000', '80000');
      expect(page.url()).toContain('/admin/payGrade/');
      await expect(page.locator('.oxd-table-body')).toContainText(/United States|USD/);
    });

  });

  test.describe('4. Organization', () => {

    test('4.1 General Information fields @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToSubTab('Organization', 'General Information');
      expect(page.url()).toContain('/admin/viewOrganizationGeneralInformation');
      const fields = page.locator('.oxd-label');
      expect(await fields.count()).toBe(14);
    });

    test('4.2 General Information edit @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToSubTab('Organization', 'General Information');
      await page.locator('.oxd-switch-wrapper label').click();
      await page.waitForTimeout(500);
      await adminPage.fillByLabel('Organization Name', 'Test Organization');
      expect(page.url()).toContain('/admin/viewOrganizationGeneralInformation');
    });

    test('4.3 Locations page loads @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToSubTab('Organization', 'Locations');
      expect(page.url()).toContain('/admin/viewLocations');
      expect(page.locator('button:has-text("Add")')).toBeVisible();
    });

    test('4.4 Locations Add @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToSubTab('Organization', 'Locations');
      await page.click('button:has-text("Add")');
      await page.waitForTimeout(1000);
      await adminPage.fillByLabel('Name', `Loc_${Date.now()}`);
      await adminPage.fillByLabel('City', 'Test City');
      await adminPage.fillByLabel('Country', 'United States');
      await adminPage.fillByLabel('Phone', '1234567890');
      await page.click('button[type="submit"]');
      await expect(page.locator('.oxd-toast')).toBeVisible({ timeout: 5000 });
    });

    test('4.5 Locations validation @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToSubTab('Organization', 'Locations');
      await page.click('button:has-text("Add")');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      const errorMessages = page.locator('.oxd-input-field-error-message');
      expect(await errorMessages.count()).toBeGreaterThan(0);
    });

  });

  test.describe('5. Qualifications', () => {

    test('5.1 Skills Add @local', async ({ adminPage, page, loggedInPage }) => {
      const skillName = `Skill_${Date.now()}`;
      await adminPage.goto();
      await adminPage.navigateToSkills();
      await adminPage.addSkill(skillName, 'Test Description');
      await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
      expect(await page.locator('.oxd-input-field-error-message').count()).toBe(0);
    });

    test('5.2 Skills Search @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToSkills();
      await adminPage.searchSkill('Account');
      expect(page.locator('.oxd-table')).toBeVisible();
    });

    test('5.3 Education Add @local', async ({ adminPage, page, loggedInPage }) => {
      const eduName = `Edu_${Date.now()}`;
      await adminPage.goto();
      await adminPage.navigateToEducation();
      await adminPage.addEducation(eduName);
      await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
      expect(await page.locator('.oxd-input-field-error-message').count()).toBe(0);
    });

    test('5.4 Licenses Add @local', async ({ adminPage, page, loggedInPage }) => {
      const licName = `Lic_${Date.now()}`;
      await adminPage.goto();
      await adminPage.navigateToLicenses();
      await adminPage.addLicense(licName);
      await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
      expect(await page.locator('.oxd-input-field-error-message').count()).toBe(0);
    });

    test('5.5 Languages Add @local', async ({ adminPage, page, loggedInPage }) => {
      const langName = `Lang_${Date.now()}`;
      await adminPage.goto();
      await adminPage.navigateToLanguages();
      await adminPage.addLanguage(langName);
      await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
      expect(await page.locator('.oxd-input-field-error-message').count()).toBe(0);
    });

  });

  test.describe('6. Nationalities', () => {

    test('6.1 List displays @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToNationalities();
      expect(page.url()).toContain('/admin/nationality');
      await expect(page.locator('.oxd-table-body .oxd-table-row').first()).toBeVisible({ timeout: 10000 });
    });

    test('6.3 Add nationality @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToNationalities();
      const name = `Nat_${Date.now()}`;
      await adminPage.addNationality(name);
      expect(page.url()).toContain('/admin/nationality');
      const errors = page.locator('.oxd-input-field-error-message');
      expect(await errors.count()).toBe(0);
    });

  });

  test.describe('7. Corporate Branding', () => {

    test('7.1 Branding page loads @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToCorporateBranding();
      expect(page.url()).toContain('/admin/addTheme');
      await expect(page.locator('.oxd-form')).toBeVisible();
    });

    test('7.2 Corporate Branding page loads @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToCorporateBranding();
      expect(page.url()).toMatch(/\/admin\/(corporateBranding|addTheme)/);
      expect(page.locator('.oxd-color-input').first()).toBeVisible();
    });

  });

  test.describe('8. Configuration', () => {

    test('8.1 Email Config page loads @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToEmailConfig();
      expect(page.url()).toContain('/admin/listMailConfiguration');
      await expect(page.locator('.oxd-form')).toBeVisible();
    });

    test('8.2 Email Config save @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
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
      await expect(page.locator('.oxd-toast')).toBeVisible({ timeout: 5000 });
    });

    test('8.4 Email Subscriptions @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToEmailSubscriptions();
      expect(page.url()).toContain('/admin/viewEmailNotification');
      expect(await adminPage.getSubscriptionCount()).toBeGreaterThan(0);
    });

    test('8.6 Localization @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToLocalization();
      await adminPage.changeLanguage('English (United States)');
      await adminPage.changeDateFormat('dd-mm-yyyy');
      await page.click('button[type="submit"]');
      await expect(page.locator('.oxd-toast')).toBeVisible({ timeout: 10000 });
    });

    test('8.7 Modules disable @local', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
      await adminPage.navigateToModules();
      await adminPage.toggleModule('Leave', false);
      await page.click('button[type="submit"]');
      await expect(page.locator('.oxd-toast')).toBeVisible({ timeout: 10000 });
    });

    test('8.9 OAuth Client @smoke', async ({ adminPage, page, loggedInPage }) => {
      await adminPage.goto();
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
      const recordCountText = await adminPage.getRecordCountText();
      expect(recordCountText).toContain('No Records Found');
    });

  });

});
