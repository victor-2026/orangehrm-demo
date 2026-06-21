import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DirectoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/directory/viewDirectory');
    await this.waitForLoad('.oxd-input-group');
    await this.page.waitForSelector('.orangehrm-directory-card', { timeout: 10000 }).catch(() => {});
  }

  async search(name: string) {
    await this.page.fill('input.oxd-input--active[placeholder="Search"]', name);
    const resp = this.page.waitForResponse(r => r.url().includes('/api/v2/directory/employees') && r.status() === 200, { timeout: 10000 });
    await this.page.click('button:has-text("Search")');
    await resp.catch(() => {});
  }

  async getSearchFormFields() {
    const labels = this.page.locator('.oxd-form .oxd-input-group .oxd-label');
    const count = await labels.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await labels.nth(i).textContent();
      if (text && text.trim() && !result.includes(text.trim())) {
        result.push(text.trim());
      }
    }
    return result;
  }

  async getEmployeeCount() {
    return this.page.locator('.orangehrm-directory-card').count();
  }

  async isResultsVisible() {
    return this.page.locator('.orangehrm-directory-card').first().isVisible().catch(() => false);
  }

  async searchByJobTitle(title: string) {
    await this.page.locator('.oxd-input-group').filter({ hasText: 'Job Title' }).locator('.oxd-select-text-input').click();
    await this.page.locator('.oxd-select-option').filter({ hasText: title }).click().catch(() => {});
    const resp = this.page.waitForResponse(r => r.url().includes('/api/v2/directory/employees') && r.status() === 200, { timeout: 10000 });
    await this.page.locator('button.oxd-button--secondary').click();
    await resp.catch(() => {});
  }

  async searchByLocation(location: string) {
    await this.page.locator('.oxd-input-group').filter({ hasText: 'Location' }).locator('.oxd-select-text-input').click();
    await this.page.locator('.oxd-select-option').filter({ hasText: location }).click().catch(() => {});
    const resp = this.page.waitForResponse(r => r.url().includes('/api/v2/directory/employees') && r.status() === 200, { timeout: 10000 });
    await this.page.locator('button.oxd-button--secondary').click();
    await resp.catch(() => {});
  }

  async getResultNames() {
    return this.page.locator('.orangehrm-directory-card-header').allTextContents();
  }
}
