import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CREDENTIALS } from '../helpers/credentials';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/auth/login');
  }

  async fillUsername(username: string) {
    await this.page.fill('input[name="username"]', username);
  }

  async fillPassword(password: string) {
    await this.page.fill('input[name="password"]', password);
  }

  async clickLogin() {
    await this.page.click('button[type="submit"]');
  }

  async loginAsAdmin() {
    await this.fillUsername(CREDENTIALS.admin.username);
    await this.fillPassword(CREDENTIALS.admin.password);
    await this.clickLogin();
    await this.waitForLoad('.oxd-topbar-header-title', 15000);
  }

  async getErrorMessage() {
    return this.page.textContent('.oxd-alert-content-text');
  }

  async isLoginErrorVisible() {
    return this.page.isVisible('.oxd-alert-content-text');
  }
}
