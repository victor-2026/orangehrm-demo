import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyInfoPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/pim/viewPersonalDetails/empNumber/1', 60000);
    await this.page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 30000 }).catch(() => {});
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async getFirstName() {
    await this.page.waitForFunction(() => {
      const el = document.querySelector('input[name="firstName"]') as HTMLInputElement;
      return el && el.value.length > 0;
    }, { timeout: 15000 }).catch(() => {});
    return this.page.inputValue('input[name="firstName"]');
  }

  async getLastName() {
    await this.page.waitForFunction(() => {
      const el = document.querySelector('input[name="lastName"]') as HTMLInputElement;
      return el && el.value.length > 0;
    }, { timeout: 15000 }).catch(() => {});
    return this.page.inputValue('input[name="lastName"]');
  }

  async editFirstName(firstName: string) {
    await this.page.fill('input[name="firstName"]', firstName);
  }

  async editLastName(lastName: string) {
    await this.page.fill('input[name="lastName"]', lastName);
  }

  async clickSave() {
    await this.page.click('button[type="submit"]');
    await this.page.waitForSelector('.oxd-toast', { timeout: 5000 }).catch(() => {});
  }

  async getToastMessage() {
    return this.page.textContent('.oxd-toast-content-text');
  }

  async waitForFirstNameInput(timeout = 30000) {
    await this.page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout });
  }

  async clickSubTab(name: string) {
    await this.page.waitForTimeout(2000);
    const tab = this.page.getByText(name, { exact: false }).first();
    const visible = await tab.isVisible().catch(() => false);
    if (visible) {
      await tab.click();
      await this.page.waitForTimeout(2000);
    }
  }

  async isPageHeadingVisible() {
    return this.page.isVisible('.oxd-form');
  }
}
