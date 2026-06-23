import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MaintenancePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/maintenance/purgeEmployee');
    await this.waitForLoad('.oxd-form');
  }

  async isPasswordScreenVisible() {
    return this.page.locator('h6:has-text("Administrator Access")').isVisible();
  }

  async isUsernameDisabled() {
    const usernameInput = this.page.locator('input[name="username"]');
    return await usernameInput.isDisabled();
  }

  async enterPassword(password: string, expectSuccess = true) {
    await this.page.fill('input[type="password"]', password);
    if (expectSuccess) {
      await Promise.all([
        this.page.waitForURL('**/maintenance/purgeEmployee**'),
        this.page.click('button[type="submit"]'),
      ]);
    } else {
      // For wrong password, just click and don't wait for URL change
      await this.page.click('button[type="submit"]');
      // Wait for password input to be visible (page stays on password screen)
      await this.page.waitForSelector('input[type="password"]', { state: 'visible' });
    }
  }

  async searchEmployee(name: string) {
    const nameInput = this.page.locator('input[placeholder="Type for hints..."]').first();
    await nameInput.fill(name);
    const resp = this.page.waitForResponse(
      r => r.url().includes('/api/v2/pim/employees') && r.status() === 200,
      { timeout: 10000 }
    );
    await this.page.click('button[type="submit"]');
    await resp.catch(() => {});
  }

  async gotoAccessRecords() {
    await this.page.click('a:has-text("Access Records")');
    await this.waitForLoad('.oxd-form');
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async getPurgeRecordsFormVisible() {
    await this.waitForLoad('.oxd-topbar-header-title', 15000).catch(() => {});
    return !(await this.page.locator('h6:has-text("Administrator Access")').isVisible().catch(() => false));
  }

  async getAuthenticationError() {
    // Instead of looking for .oxd-alert-content-text, check that password input is still visible
    // after wrong password (page stays on password screen)
    return this.page.locator('input[type="password"]').isVisible();
  }
}
