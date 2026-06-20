import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PerformancePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/performance/searchEvaluatePerformanceReview');
    await this.waitForLoad('.oxd-table');
  }

  async searchReview(keyword: string) {
    await this.page.fill('input.oxd-input--active[placeholder="Search"]', keyword);
    const resp = this.page.waitForResponse(r => r.url().includes('/api/v2/performance/employees/reviews') && r.status() === 200, { timeout: 10000 });
    await this.page.click('button:has-text("Search")');
    await resp.catch(() => {});
  }
}
