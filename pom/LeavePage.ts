import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LeavePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(path?: string) {
    if (path) {
      await super.goto(path);
    } else {
      await super.goto('/web/index.php/leave/viewLeaveList');
    }
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async waitForForm() {
    await this.waitForLoad('.oxd-form');
  }

  async applyLeave(leaveType: string, fromDate: string, toDate: string, comment?: string) {
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
