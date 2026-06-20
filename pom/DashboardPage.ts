import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/dashboard/index');
    await this.waitForLoad('.oxd-topbar-header-title');
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async isQuickLaunchVisible() {
    return this.page.isVisible('.orangehrm-dashboard-widget');
  }

  async getWidgetCount() {
    return this.page.locator('.orangehrm-dashboard-widget').count();
  }

  async navigateTo(menuLabel: string) {
    await this.page.click(`.oxd-main-menu-item:has-text("${menuLabel}")`);
    await this.page.waitForSelector('.oxd-topbar-header-title', { timeout: 5000 }).catch(() => {});
  }
}
