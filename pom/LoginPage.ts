import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CREDENTIALS } from '../helpers/credentials';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/auth/login');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    // Demo site flaky on GH runners — retry with reload if login not rendered
    for (let i = 0; i < 3; i++) {
      if (await this.page.locator('input[name="username"]').isVisible().catch(() => false)) break;
      await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await this.page.waitForTimeout(2000);
    }
    await expect(this.page.locator('input[name="username"]')).toBeVisible({ timeout: 30000 });
  }

  async fillUsername(username: string) {
    await expect(this.page.locator('input[name="username"]')).toBeVisible({ timeout: 30000 });
    await this.page.fill('input[name="username"]', username);
  }

  async fillPassword(password: string) {
    await expect(this.page.locator('input[name="password"]')).toBeVisible({ timeout: 30000 });
    await this.page.fill('input[name="password"]', password);
  }

  async clickLogin() {
    await this.page.click('button[type="submit"]');
  }

  async loginAsAdmin() {
    await this.fillUsername(CREDENTIALS.admin.username);
    await this.fillPassword(CREDENTIALS.admin.password);
    await this.clickLogin();
    await this.waitForLoad('.oxd-topbar-header-title', 30000);
  }

  async getErrorMessage() {
    return this.page.textContent('.oxd-alert-content-text');
  }

  async isLoginErrorVisible() {
    return this.page.isVisible('.oxd-alert-content-text');
  }
}
