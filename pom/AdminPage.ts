import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/admin/viewSystemUsers');
    await this.waitForLoad('.oxd-table');
  }

  async clickAdd() {
    await this.page.click('button:has-text("Add")');
    await this.waitForLoad('.oxd-form');
  }

  async fillUserForm(userRole: string, empName: string, username: string, password: string) {
    const selects = this.page.locator('.oxd-select-text-input');
    await selects.nth(0).click();
    await this.page.click(`.oxd-select-option:has-text("${userRole}")`);

    const empInput = this.page.locator('input[placeholder="Type for hints..."]');
    await empInput.fill(empName);
    await this.waitForLoad('.oxd-autocomplete-option', 3000).catch(() => {});

    const option = this.page.locator('.oxd-autocomplete-option').first();
    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click();
    }

    await selects.nth(1).click();
    await this.page.click('.oxd-select-option:has-text("Enabled")');

    await this.fillByLabel('Username', username);
    await this.page.locator('input[type="password"]').first().fill(password);
    await this.page.locator('input[type="password"]').nth(1).fill(password);
  }

  async clickSave() {
    await this.page.click('button[type="submit"]');
    await this.page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 5000 }).catch(() => {});
  }

  async searchUser(username: string) {
    const searchInput = this.page.locator('.oxd-form .oxd-input-group input.oxd-input').first();
    await searchInput.fill(username);
    const resp = this.page.waitForResponse(r => r.url().includes('/api/v2/admin/users') && r.status() === 200, { timeout: 10000 });
    await this.page.click('button:has-text("Search")');
    await resp.catch(() => {});
  }

  async deleteUser(username: string) {
    const row = this.page.locator(`.oxd-table-row:has-text("${username}")`);
    await row.locator('button:has-text("Delete")').click();
    await this.page.click('button:has-text("Yes, Delete")');
    await this.waitForLoad('.oxd-table-body', 3000).catch(() => {});
  }

  async getRecordCount() {
    const text = await this.page.textContent('.orangehrm-horizontal-padding');
    return text ? parseInt(text.match(/\d+/)?.[0] || '0') : 0;
  }

  async getFirstUsername() {
    const firstRow = this.page.locator('.oxd-table-body .oxd-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const usernameCell = firstRow.locator('.oxd-table-cell').nth(1);
    return (await usernameCell.textContent())?.trim() ?? '';
  }

  async viewFirstUser() {
    const firstRow = this.page.locator('.oxd-table-body .oxd-table-row').first();
    await firstRow.click();
    await this.waitForLoad('.oxd-form');
  }

  async isUserFormVisible() {
    return this.page.locator('text=System Users').isVisible();
  }
}
