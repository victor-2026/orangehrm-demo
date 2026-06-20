import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  protected async waitForLoad(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  protected async fillByLabel(labelText: string, value: string) {
    const group = this.page.locator('.oxd-form .oxd-input-group, .oxd-input-group').filter({ hasText: labelText });
    const input = group.locator('input.oxd-input--active');
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
  }

  async getCurrentUrl() {
    return this.page.url();
  }
}
