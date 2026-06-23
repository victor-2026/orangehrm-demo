import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string, timeout = 30000) {
    await this.page.goto(path, { timeout, waitUntil: 'domcontentloaded' });
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
      await this.page.waitForTimeout(300);
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
