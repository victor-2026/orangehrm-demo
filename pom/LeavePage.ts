import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginPage } from './LoginPage';

export class LeavePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login() {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();
  }

  async goto(path?: string) {
    if (path) {
      await super.goto(path);
    } else {
      await super.goto('/web/index.php/leave/viewLeaveList');
    }
  }

  async gotoMyLeave() {
    await super.goto('/web/index.php/leave/viewMyLeaveList');
  }

  async gotoEntitlements() {
    await super.goto('/web/index.php/leave/viewLeaveEntitlements');
  }

  async getPageHeading() {
    return this.page.textContent('.orangehrm-main-title');
  }

  async getTopbarTabs() {
    const tabs = await this.page.locator('.oxd-main-menu-item').all();
    return tabs.map(async tab => tab.textContent());
  }

  async clickTopbarTab(name: string) {
    await this.page.click(`.oxd-main-menu-item:has-text("${name}")`);
  }

  async getSearchFormFields() {
    const fields = await this.page.locator('.oxd-form .oxd-input-group').all();
    const fieldTexts = await Promise.all(fields.map(async field => {
      const label = field.locator('.oxd-label');
      return label.textContent();
    }));
    return fieldTexts.filter(text => text && text.trim().length > 0);
  }

  async isTableVisible() {
    return this.page.isVisible('.oxd-table');
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async waitForForm() {
    await this.waitForLoad('.oxd-form');
  }

  async applyLeave(leaveType: string, fromDate: string, toDate: string, comment?: string) {
    await this.login();
    await super.goto('/web/index.php/leave/applyLeave');
    await this.waitForLoad('.oxd-form');
    await this.page.click('.oxd-select-text-input');
    await this.page.click(`.oxd-select-option:has-text("${leaveType}")`);
    await this.page.fill('input.oxd-input--active[name="fromDate"]', fromDate);
    await this.page.fill('input.oxd-input--active[name="toDate"]', toDate);
    if (comment) {
      await this.page.fill('textarea', comment);
    }
    await this.page.click('button[type="submit"]');
  }

  async getLeaveBalance() {
    return this.page.textContent('.oxd-text--subtitle-2');
  }

  async getLeaveListCount() {
    return this.page.locator('.oxd-table-body .oxd-table-row').count();
  }

  async getStatus() {
    return this.page.textContent('.oxd-status-cell');
  }
}
