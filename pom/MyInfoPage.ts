import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyInfoPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/pim/viewPersonalDetails/empNumber/1');
    await this.page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 15000 }).catch(() => {});
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

  async waitForFirstNameInput(timeout = 15000) {
    await this.page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout });
  }

  async clickSubTab(name: string) {
    await this.page.locator('.orangehrm-tabs-item').filter({ hasText: name }).click();
    await this.waitForLoad('.orangehrm-main-title', 10000).catch(() => {});
  }

  async isPageHeadingVisible() {
    return this.page.isVisible('.orangehrm-main-title');
  }

  async getSubTabCount() {
    return this.page.locator('.orangehrm-tabs-item').count();
  }
}
