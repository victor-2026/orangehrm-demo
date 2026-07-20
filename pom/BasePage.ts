import { Page, expect } from '@playwright/test';
import { CREDENTIALS } from '../helpers/credentials';

export class BasePage {
  constructor(public readonly page: Page) {}

  async goto(path: string, timeout = 30000) {
    const baseURL = process.env.BASE_URL || (process.env.LOCAL === 'true' ? 'http://localhost:8080' : 'https://opensource-demo.orangehrmlive.com');
    await this.page.goto(`${baseURL}${path}`, { timeout, waitUntil: 'domcontentloaded' });
    await this.reloginIfNeeded(path, timeout);
  }

  private async reloginIfNeeded(path: string, timeout: number) {
    if (this.page.url().includes('/auth/login')) {
      await this.page.fill('input[name="username"]', CREDENTIALS.admin.username);
      await this.page.fill('input[name="password"]', CREDENTIALS.admin.password);
      await this.page.click('button[type="submit"]');
      await this.page.waitForURL(`**${path}`, { timeout });
    }
  }

  protected async waitForLoad(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  protected async fillByLabel(labelText: string, value: string) {
    const group = this.page.locator('.oxd-form .oxd-input-group, .oxd-input-group').filter({ hasText: labelText });
    const select = group.locator('.oxd-select-wrapper');
    if (await select.isVisible().catch(() => false)) {
      await select.click();
      await this.page.locator(`.oxd-select-option:has-text("${value}")`).first().click();
      return;
    }
    const input = group.locator('input.oxd-input, textarea.oxd-textarea');
    await input.first().waitFor({ state: 'visible', timeout: 5000 });
    await input.first().fill(value);
  }

  async getCurrentUrl() {
    return this.page.url();
  }
}
