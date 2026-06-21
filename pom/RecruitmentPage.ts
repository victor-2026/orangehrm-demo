import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class RecruitmentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/recruitment/viewCandidates');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async clickAdd() {
    await this.page.click('button:has-text("Add")');
    await this.waitForLoad('.oxd-form');
  }

  async fillCandidateForm(firstName: string, lastName: string, email: string, vacancy?: string) {
    await this.page.fill('input[name="firstName"]', firstName);
    await this.page.fill('input[name="lastName"]', lastName);
    await this.fillByLabel('Email', email);
    if (vacancy) {
      const vacSelect = this.page.locator('.oxd-select-text-input').first();
      await vacSelect.click();
      await this.page.click(`.oxd-select-option:has-text("${vacancy}")`);
    }
  }

  async clickSave() {
    await this.page.click('button[type="submit"]');
    await this.page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 5000 }).catch(() => {});
  }

  async searchCandidate(name: string) {
    await this.page.fill('input.oxd-input--active[placeholder="Search"]', name);
    const resp = this.page.waitForResponse(r => r.url().includes('/api/v2/recruitment/candidates') && r.status() === 200, { timeout: 10000 });
    await this.page.click('button:has-text("Search")');
    await resp.catch(() => {});
  }

  async getRecordCount() {
    const text = await this.page.textContent('.orangehrm-horizontal-padding');
    return text ? parseInt(text.match(/\d+/)?.[0] || '0') : 0;
  }

  async gotoVacancies() {
    await super.goto('/web/index.php/recruitment/viewJobVacancy');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async gotoAddVacancy() {
    await super.goto('/web/index.php/recruitment/addJobVacancy');
    await this.waitForLoad('.oxd-form', 10000).catch(() => {});
  }

  async getTopbarTabs() {
    const tabs = this.page.locator('.oxd-topbar-body-nav-tab');
    const count = await tabs.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await tabs.nth(i).locator('.oxd-topbar-body-nav-tab-item').textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  async clickTopbarTab(name: string) {
    await this.page.locator('.oxd-topbar-body-nav-tab-item').filter({ hasText: name }).click();
  }

  async getSearchFormFields() {
    const fields = this.page.locator('.oxd-form .oxd-input-group');
    const count = await fields.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const label = await fields.nth(i).locator('.oxd-label').textContent();
      if (label && label.trim()) labels.push(label.trim());
    }
    return labels;
  }

  async isTableVisible() {
    return this.page.isVisible('.oxd-table');
  }
}
