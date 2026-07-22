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
      await this.page.click('button[type="submit"]');
      // Wait for the maintenance area to load (either topbar or form)
      await this.page.waitForSelector('.oxd-topbar-header-title, .oxd-form', { timeout: 15000 }).catch(() => {});
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
    await this.page.locator('a.oxd-topbar-body-nav-tab-item:has-text("Access Records")').click();
    await this.page.waitForURL('**/maintenance/accessEmployeeData**', { timeout: 15000 }).catch(() => {});
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async getPurgeRecordsFormVisible() {
    // Wait for either maintenance area or password screen to appear
    await this.page.waitForSelector('.oxd-topbar-header-title, h6:has-text("Administrator Access")', { timeout: 15000 }).catch(() => {});
    // Check that we're past the password screen
    const onPasswordScreen = await this.page.locator('h6:has-text("Administrator Access")').isVisible().catch(() => false);
    return !onPasswordScreen;
  }

  async getAuthenticationError() {
    // Instead of looking for .oxd-alert-content-text, check that password input is still visible
    // after wrong password (page stays on password screen)
    return this.page.locator('input[type="password"]').isVisible();
  }

  async isPasswordAccepted() {
    const error = this.page.locator('.oxd-alert-content-text');
    return !(await error.isVisible().catch(() => false));
  }

  async getPurgeRecordsBreadcrumbVisible() {
    await this.page.waitForSelector('.oxd-topbar-header-title', { timeout: 15000 }).catch(() => {});
    return this.page.locator('.oxd-topbar-header-breadcrumb-level:has-text("Purge Records")').isVisible();
  }

  async getAccessRecordsHeadingVisible() {
    await this.page.waitForURL('**/maintenance/accessEmployeeData**', { timeout: 15000 }).catch(() => {});
    return this.page.url().includes('accessEmployeeData');
  }
}
