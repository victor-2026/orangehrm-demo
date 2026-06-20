import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DirectoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/directory/viewDirectory');
    await this.waitForLoad('.oxd-input-group');
  }

  async search(name: string) {
    await this.page.fill('input.oxd-input--active[placeholder="Search"]', name);
    const resp = this.page.waitForResponse(r => r.url().includes('/api/v2/directory/employees') && r.status() === 200, { timeout: 10000 });
    await this.page.click('button:has-text("Search")');
    await resp.catch(() => {});
  }
}
