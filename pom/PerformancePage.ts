import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginPage } from './LoginPage';

export class PerformancePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login() {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();
  }

  async goto() {
    await this.login();
    await super.goto('/web/index.php/performance/viewReviewModule');
  }

  async gotoReviewList() {
    await this.login();
    await super.goto('/web/index.php/performance/searchEvaluatePerformanceReview');
  }

  async gotoMyTrackers() {
    await this.login();
    await super.goto('/web/index.php/performance/viewMyPerformanceTracker');
  }

  async gotoKPIs() {
    await this.login();
    await super.goto('/web/index.php/performance/defineKpi');
  }

  async clickMyReviews() {
    await this.page.click('a:has-text("My Reviews")');
  }

  async clickReviewList() {
    await this.page.click('a:has-text("Review List")');
  }

  async clickMyTrackers() {
    await this.page.click('a:has-text("My Trackers")');
  }

  async clickKPIs() {
    await this.page.click('a:has-text("KPIs")');
  }

  async getPageHeading() {
    return this.page.locator('.oxd-topbar-header-title').textContent();
  }

  async getRecordCount() {
    return this.page.textContent('.oxd-table-cell-right');
  }

  async searchReview(employeeName?: string, status?: string, fromDate?: string, toDate?: string) {
    if (employeeName) {
      await this.fillByLabel('Employee Name', employeeName);
    }
    if (status) {
      await this.fillByLabel('Status', status);
    }
    if (fromDate) {
      await this.fillByLabel('From Date', fromDate);
    }
    if (toDate) {
      await this.fillByLabel('To Date', toDate);
    }
    await this.page.click('button:has-text("Search")');
  }

  async isTableVisible() {
    return this.page.locator('.oxd-table').isVisible();
  }

  async getSearchFormFields() {
    const fields = await this.page.locator('.oxd-form .oxd-input-group').all();
    const fieldTexts = await Promise.all(fields.map(async field => {
      const label = field.locator('.oxd-label');
      return label.textContent();
    }));
    return fieldTexts.filter(text => text && text.trim().length > 0);
  }
}
