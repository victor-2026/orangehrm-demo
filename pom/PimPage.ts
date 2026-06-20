import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PimPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/pim/viewEmployeeList');
    await this.waitForLoad('.oxd-table');
  }

  async viewFirstEmployee() {
    const firstRow = this.page.locator('.oxd-table-body .oxd-table-row').first();
    await firstRow.click();
    await this.waitForLoad('.oxd-form');
  }

  async isPersonalDetailsVisible() {
    return this.page.locator('.orangehrm-card-container').isVisible();
  }

  async clickAdd() {
    await this.page.click('button:has-text("Add")');
    await this.waitForLoad('.oxd-form');
  }

  async fillEmployeeForm(firstName: string, lastName: string, employeeId?: string) {
    await this.page.fill('input[name="firstName"]', firstName);
    await this.page.fill('input[name="lastName"]', lastName);
    if (employeeId) {
      await this.page.fill('input.oxd-input--active', employeeId);
    }
  }

  async toggleCreateLogin() {
    await this.page.locator('.oxd-switch-input').click();
  }

  async fillLoginDetails(username: string, password: string) {
    await this.fillByLabel('Username', username);
    await this.page.locator('input[type="password"]').first().fill(password);
    await this.page.locator('input[type="password"]').nth(1).fill(password);
  }

  async clickSave() {
    await this.page.click('button[type="submit"]');
    await this.page.waitForSelector('.oxd-toast', { timeout: 5000 }).catch(() => {});
  }

  async searchEmployee(name: string) {
    const nameInput = this.page.locator('.oxd-form .oxd-input-group input[placeholder="Type for hints..."]').first();
    await nameInput.fill(name);
    const resp = this.page.waitForResponse(r => r.url().includes('/api/v2/pim/employees') && r.status() === 200, { timeout: 10000 });
    await this.page.click('button:has-text("Search")');
    await resp.catch(() => {});
  }

  async clickEmployeeRow(name: string) {
    await this.page.locator(`.oxd-table-row:has-text("${name}")`).first().click();
    await this.waitForLoad('.oxd-form');
  }

  async getEmployeeFirstName() {
    return this.page.inputValue('input[name="firstName"]');
  }

  async getEmployeeLastName() {
    return this.page.inputValue('input[name="lastName"]');
  }

  async editFirstName(firstName: string) {
    await this.page.fill('input[name="firstName"]', firstName);
  }

  async deleteEmployee(name: string) {
    const row = this.page.locator(`.oxd-table-row:has-text("${name}")`);
    await row.locator('button:has-text("Delete")').click();
    await this.page.click('button:has-text("Yes, Delete")');
    await this.waitForLoad('.oxd-table-body', 3000).catch(() => {});
  }

  async waitForFirstNameInput(timeout = 10000) {
    await this.page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout });
  }
}
