import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TimePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/time/viewTimeModule');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async isTimesheetVisible() {
    return this.page.isVisible('.oxd-sheet');
  }

  async getPunchInStatus() {
    return this.page.textContent('.orangehrm-attendance-item');
  }
}
