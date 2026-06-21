import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/admin/viewSystemUsers');
    await this.waitForLoad('.oxd-table-body .oxd-table-row');
  }

  async clickAdd() {
    await this.page.click('button:has-text("Add")');
    await this.waitForLoad('.oxd-form');
  }

  async fillUserForm(userRole: string, empName: string, username: string, password: string, status: string = 'Enabled') {
    const selects = this.page.locator('.oxd-select-text-input');
    await selects.nth(0).click();
    await this.page.click(`.oxd-select-option:has-text("${userRole}")`);

    const empInput = this.page.locator('input[placeholder="Type for hints..."]');
    await empInput.click();
    await empInput.pressSequentially(empName, { delay: 100 });
    await this.page.waitForTimeout(1500);
    const dropdown = this.page.locator('.oxd-autocomplete-dropdown');
    if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await empInput.press('ArrowDown');
      await this.page.waitForTimeout(300);
      await empInput.press('Enter');
      await this.page.waitForTimeout(500);
    }

    await selects.nth(1).click();
    await this.page.click(`.oxd-select-option:has-text("${status}")`);

    await this.fillByLabel('Username', username);
    await this.page.locator('input[type="password"]').first().fill(password);
    await this.page.locator('input[type="password"]').nth(1).fill(password);
  }

  async clickSave() {
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/viewSystemUsers', { timeout: 15000 });
    await this.waitForLoad('.oxd-table-body .oxd-table-row', 15000);
  }

  async searchUser(username: string) {
    const searchInput = this.page.locator('.oxd-form .oxd-input-group input.oxd-input').first();
    await searchInput.fill(username);
    const resp = this.page.waitForResponse(r => r.url().includes('/api/v2/admin/users') && r.status() === 200, { timeout: 10000 });
    await this.page.click('button:has-text("Search")');
    await resp.catch(() => {});
  }

  async searchByUserRole(role: string) {
    const userRoleSelect = this.page.locator('.oxd-form .oxd-select-text-input').first();
    await userRoleSelect.click();
    await this.page.click(`.oxd-select-option:has-text("${role}")`);
    await this.page.click('button:has-text("Search")');
    await this.waitForLoad('.oxd-table-body .oxd-table-row');
  }

  async searchByStatus(status: string) {
    const statusSelect = this.page.locator('.oxd-form .oxd-select-text-input').nth(2);
    await statusSelect.click();
    await this.page.click(`.oxd-select-option:has-text("${status}")`);
    await this.page.click('button:has-text("Search")');
    await this.waitForLoad('.oxd-table-body .oxd-table-row');
  }

  async searchCombined(userRole: string, status: string) {
    const userRoleSelect = this.page.locator('.oxd-form .oxd-select-text-input').first();
    await userRoleSelect.click();
    await this.page.click(`.oxd-select-option:has-text("${userRole}")`);

    const statusSelect = this.page.locator('.oxd-form .oxd-select-text-input').nth(2);
    await statusSelect.click();
    await this.page.click(`.oxd-select-option:has-text("${status}")`);

    await this.page.click('button:has-text("Search")');
    await this.waitForLoad('.oxd-table-body .oxd-table-row');
  }

  async resetSearch() {
    await this.page.click('button:has-text("Reset")');
    await this.page.waitForLoadState('networkidle');
    await this.waitForLoad('.oxd-table-body .oxd-table-row');
  }

  async searchWithNoResults() {
    const searchInput = this.page.locator('.oxd-form .oxd-input-group input.oxd-input').first();
    await searchInput.fill('ZZZNonoExistsUser');
    await this.page.click('button:has-text("Search")');
    await this.waitForLoad('.oxd-table-body .oxd-table-row');
  }

  async clickUserDetails(username: string) {
    const row = this.page.locator(`.oxd-table-body .oxd-table-row:has-text("${username}")`);
    await row.click();
    await this.waitForLoad('.oxd-form');
  }

  async editUserStatus(username: string, newStatus: string) {
    await this.clickUserDetails(username);
    const statusSelect = this.page.locator('.oxd-form .oxd-select-text-input');
    await statusSelect.click();
    await this.page.click(`.oxd-select-option:has-text("${newStatus}")`);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/viewSystemUsers', { timeout: 15000 });
    await this.waitForLoad('.oxd-table-body .oxd-table-row');
  }

  async getTopbarSubTabs(): Promise<string[]> {
    const links = this.page.locator('.oxd-dropdown-menu .oxd-topbar-body-nav-tab-link');
    const count = await links.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).textContent();
      texts.push(text?.trim() ?? '');
    }
    return texts;
  }

  async navigateToSubTab(tabName: string, subTabName: string) {
    await this.clickTopbarTab(tabName);
    await this.clickSubTab(subTabName);
  }

  // Job module methods
  async navigateToJobTitleList() {
    await this.navigateToSubTab('Job', 'Job Titles');
    await this.waitForLoad('.oxd-table');
  }

  async addJobTitle(name: string, description?: string) {
    await this.page.click('button:has-text("Add")');
    await this.fillByLabel('Job Title', name);
    if (description) {
      await this.fillByLabel('Job Description', description);
    }
    await this.page.click('button[type="submit"]');
    await this.waitForLoad('.oxd-table');
  }

  async getJobTitleCount() {
    const text = await this.page.textContent('.orangehrm-horizontal-padding');
    return text ? parseInt(text.match(/\d+/)?.[0] || '0') : 0;
  }

  // Pay Grades methods
  async navigateToPayGrades() {
    await this.navigateToSubTab('Job', 'Pay Grades');
    await this.waitForLoad('.oxd-table');
  }

  async addPayGrade(name: string) {
    await this.page.click('button:has-text("Add")');
    await this.fillByLabel('Name', name);
    await this.page.click('button[type="submit"]');
    await this.waitForLoad('.oxd-table');
  }

  async addPayGradeCurrency(gradeName: string, currency: string, min: string, max: string) {
    await this.page.click(`.oxd-table-row:has-text("${gradeName}")`);
    await this.page.click('button:has-text("Currency")');
    await this.fillByLabel('Currency', currency);
    await this.fillByLabel('Min Salary', min);
    await this.fillByLabel('Max Salary', max);
    await this.page.click('button[type="submit"]');
    await this.waitForLoad('.oxd-table');
  }

  // Skills methods
  async navigateToSkills() {
    await this.navigateToSubTab('Qualifications', 'Skills');
    await this.waitForLoad('.oxd-table');
  }

  async addSkill(name: string, description?: string) {
    await this.page.click('button:has-text("Add")');
    await this.fillByLabel('Skill Name', name);
    if (description) {
      await this.fillByLabel('Skill Description', description);
    }
    await this.page.click('button[type="submit"]');
    await this.waitForLoad('.oxd-table');
  }

  async searchSkill(name: string) {
    await this.fillByLabel('Search', name);
    await this.page.click('button:has-text("Search")');
    await this.waitForLoad('.oxd-table');
  }

  // Education methods
  async navigateToEducation() {
    await this.navigateToSubTab('Qualifications', 'Education');
    await this.waitForLoad('.oxd-table');
  }

  async addEducation(level: string) {
    await this.page.click('button:has-text("Add")');
    await this.fillByLabel('Education Level', level);
    await this.page.click('button[type="submit"]');
    await this.waitForLoad('.oxd-table');
  }

  // Licenses methods
  async navigateToLicenses() {
    await this.navigateToSubTab('Qualifications', 'Licenses');
    await this.waitForLoad('.oxd-table');
  }

  async addLicense(name: string) {
    await this.page.click('button:has-text("Add")');
    await this.fillByLabel('License Name', name);
    await this.page.click('button[type="submit"]');
    await this.waitForLoad('.oxd-table');
  }

  // Languages methods
  async navigateToLanguages() {
    await this.navigateToSubTab('Qualifications', 'Languages');
    await this.waitForLoad('.oxd-table');
  }

  async addLanguage(name: string) {
    await this.page.click('button:has-text("Add")');
    await this.fillByLabel('Language Name', name);
    await this.page.click('button[type="submit"]');
    await this.waitForLoad('.oxd-table');
  }

  // Nationalities methods
  async navigateToNationalities() {
    await this.clickTopbarTab('Nationalities');
    await this.waitForLoad('.oxd-table');
  }

  async addNationality(name: string) {
    await this.page.click('button:has-text("Add")');
    await this.fillByLabel('Nationality', name);
    await this.page.click('button[type="submit"]');
    await this.waitForLoad('.oxd-table');
  }

  async clickNationalityPage(pageNum: number) {
    await this.page.click(`.oxd-table-pagination a:has-text("${pageNum}")`);
    await this.waitForLoad('.oxd-table');
  }

  // Corporate Branding methods
  async navigateToCorporateBranding() {
    await this.clickTopbarTab('Corporate Branding');
    await this.waitForLoad('.oxd-color-block');
  }

  async changePrimaryColor(hexColor: string) {
    const colorInput = this.page.locator('.oxd-input[type="color"]').first();
    await colorInput.fill(hexColor);
    await this.page.click('button:has-text("Preview")');
  }

  // Email Configuration methods
  async navigateToEmailConfig() {
    await this.navigateToSubTab('Configuration', 'Email Configuration');
    await this.waitForLoad('.oxd-form');
  }

  async fillEmailConfig(config: any) {
    await this.fillByLabel('Mail Sent As', config.mailSentAs);
    await this.fillByLabel('SMTP Host', config.smtpHost);
    await this.fillByLabel('SMTP Port', config.smtpPort);
    if (config.useSmtpAuth) {
      await this.page.check('input[name="smtp_auth"]');
      await this.fillByLabel('SMTP User', config.smtpUser);
      await this.fillByLabel('SMTP Password', config.smtpPassword);
    }
  }

  async saveEmailConfig() {
    await this.page.click('button[type="submit"]');
    await this.waitForLoad('.oxd-form');
  }

  // Email Subscriptions methods
  async navigateToEmailSubscriptions() {
    await this.navigateToSubTab('Configuration', 'Email Subscriptions');
    await this.waitForLoad('.oxd-table');
  }

  async getSubscriptionCount() {
    const text = await this.page.textContent('.orangehrm-horizontal-padding');
    return text ? parseInt(text.match(/\d+/)?.[0] || '0') : 0;
  }

  // Localization methods
  async navigateToLocalization() {
    await this.navigateToSubTab('Configuration', 'Localization');
    await this.waitForLoad('.oxd-form');
  }

  async changeLanguage(language: string) {
    const languageSelect = this.page.locator('.oxd-select-text-input');
    await languageSelect.click();
    await this.page.click(`.oxd-select-option:has-text("${language}")`);
  }

  async changeDateFormat(format: string) {
    const formatSelect = this.page.locator('.oxd-select-text-input').nth(1);
    await formatSelect.click();
    await this.page.click(`.oxd-select-option:has-text("${format}")`);
  }

  // Modules methods
  async navigateToModules() {
    await this.navigateToSubTab('Configuration', 'Modules');
    await this.waitForLoad('.oxd-switch-wrapper');
  }

  async toggleModule(moduleName: string, enable: boolean) {
    const switchInput = this.page.locator('.oxd-switch-input').filter({ hasText: moduleName });
    if (enable !== (await switchInput.isChecked())) {
      await switchInput.click();
    }
  }

  async getModuleCount() {
    return await this.page.locator('.oxd-switch-wrapper').count();
  }

  // OAuth Clients methods
  async navigateToOAuthClients() {
    await this.navigateToSubTab('Configuration', 'Register OAuth Client');
    await this.waitForLoad('.oxd-table');
  }

  async deleteUser(username: string) {
    const row = this.page.locator(`.oxd-table-row:has-text("${username}")`);
    await row.locator('button').first().click();
    await this.page.click('button:has-text("Yes, Delete")');
    await this.waitForLoad('.oxd-table-body', 3000).catch(() => {});
  }

  async deleteUserWithConfirm(username: string) {
    const row = this.page.locator(`.oxd-table-body .oxd-table-row:has-text("${username}")`);
    await row.locator('button').first().click();
    await this.page.locator('.oxd-overlay:not(.oxd-overlay--hide)').waitFor({ state: 'visible', timeout: 5000 });
    await this.page.click('button:has-text("Yes, Delete")');
    await this.page.waitForTimeout(1000);
  }

  async cancelDelete(username: string) {
    const row = this.page.locator(`.oxd-table-body .oxd-table-row:has-text("${username}")`);
    await row.locator('button').first().click();
    await this.page.locator('.oxd-overlay:not(.oxd-overlay--hide)').waitFor({ state: 'visible', timeout: 5000 });
    await this.page.click('button:has-text("No, Cancel")');
    await this.page.waitForTimeout(500);
  }

  async getTopbarTabs(): Promise<string[]> {
    const tabs = this.page.locator('.oxd-topbar-body-nav-tab-item');
    const count = await tabs.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await tabs.nth(i).textContent();
      texts.push(text?.trim() ?? '');
    }
    return texts;
  }

  async clickTopbarTab(name: string) {
    await this.page.locator(`.oxd-topbar-body-nav-tab-item:has-text("${name}")`).click();
    await this.page.waitForTimeout(500);
  }

  async getSubTabs(): Promise<string[]> {
    const links = this.page.locator('.oxd-dropdown-menu .oxd-topbar-body-nav-tab-link');
    const count = await links.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).textContent();
      texts.push(text?.trim() ?? '');
    }
    return texts;
  }

  async clickSubTab(name: string) {
    await this.page.locator(`.oxd-dropdown-menu .oxd-topbar-body-nav-tab-link:has-text("${name}")`).click();
    await this.page.waitForTimeout(1000);
  }

  async getTableHeaders(): Promise<string[]> {
    const headers = this.page.locator('.oxd-table-header-cell');
    const count = await headers.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      const clean = text?.replace(/Ascending|Descending/g, '').trim() ?? '';
      texts.push(clean);
    }
    return texts;
  }

  async getTableRows() {
    return this.page.locator('.oxd-table-body .oxd-table-row').count();
  }

  async getRecordCountText() {
    return (await this.page.textContent('.orangehrm-horizontal-padding'))?.trim() ?? '';
  }

  async getRowData(index: number): Promise<string[]> {
    const row = this.page.locator('.oxd-table-body .oxd-table-row').nth(index);
    const cells = row.locator('.oxd-table-cell');
    const count = await cells.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await cells.nth(i).textContent())?.trim() ?? '');
    }
    return texts;
  }

  async isDeleteDialogVisible() {
    return this.page.locator('.oxd-overlay').first().isVisible({ timeout: 3000 }).catch(() => false);
  }

  async getRecordCount() {
    const text = await this.page.textContent('.orangehrm-horizontal-padding');
    return text ? parseInt(text.match(/\d+/)?.[0] || '0') : 0;
  }

  async getFirstUsername() {
    const firstRow = this.page.locator('.oxd-table-body .oxd-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const usernameCell = firstRow.locator('.oxd-table-cell').nth(1);
    return (await usernameCell.textContent())?.trim() ?? '';
  }

  async viewFirstUser() {
    const firstRow = this.page.locator('.oxd-table-body .oxd-table-row').first();
    await firstRow.click();
    await this.waitForLoad('.oxd-form');
  }

  async isUserFormVisible() {
    return this.page.locator('text=System Users').isVisible();
  }
}
