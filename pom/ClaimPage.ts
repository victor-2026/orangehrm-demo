import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ClaimPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/claim/viewAssignClaim');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async isClaimListVisible() {
    return this.page.isVisible('.oxd-table').catch(() => false);
  }

  async clickAdd() {
    await this.page.click('button:has-text("Assign Claim")');
    await this.waitForLoad('.oxd-form');
  }

  async fillEmployee(name: string) {
    const input = this.page.locator('input[placeholder="Type for hints..."]');
    await input.click();
    await input.pressSequentially(name, { delay: 100 });
    await this.page.waitForTimeout(1500);
    const dropdown = this.page.locator('.oxd-autocomplete-dropdown');
    if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      const option = dropdown.locator('.oxd-autocomplete-option').first();
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click({ force: true });
        await this.page.waitForTimeout(500);
      }
    }
  }

  async selectEvent(name: string) {
    const selects = this.page.locator('.oxd-select-text-input');
    await selects.nth(0).click();
    await this.page.click(`.oxd-select-option:has-text("${name}")`);
  }

  async selectCurrency(name: string) {
    const selects = this.page.locator('.oxd-select-text-input');
    await selects.nth(1).click();
    await this.page.click(`.oxd-select-option:has-text("${name}")`);
  }

  async fillRemarks(text: string) {
    const textarea = this.page.locator('textarea');
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill(text);
    }
  }

  async clickCreate() {
    const resp = this.page.waitForResponse(
      r => r.url().includes('/api/v2/claim/employees/') && r.request().method() === 'POST',
      { timeout: 10000 }
    );
    await this.page.click('button[type="submit"]');
    await resp.catch(() => {});
  }

  async getSuccessToast() {
    return this.page.locator('.oxd-toast, .oxd-text--toast-title').first().textContent().catch(() => '');
  }

  async submitClaim() {
    await this.page.click('button:has-text("Submit")');
    await this.waitForLoad('.oxd-toast', 5000).catch(() => {});
  }

  async isClaimDetailPage() {
    return (await this.page.url()).includes('/claim/assignClaim/id/');
  }

  async gotoEmployeeClaims() {
    const link = this.page.locator('a:has-text("Employee Claims")');
    if (await link.isVisible().catch(() => false)) {
      await link.click();
    } else {
      await super.goto('/web/index.php/claim/viewEmployeeClaims');
    }
    await this.waitForLoad('.oxd-form', 5000).catch(() => {});
  }

  async searchByReference(refId: string) {
    const input = this.page.locator('.oxd-input-group:has-text("Reference Id") input.oxd-input').first();
    await input.fill(refId);
    const resp = this.page.waitForResponse(
      r => r.url().includes('/api/v2/claim/employees/') && r.status() === 200,
      { timeout: 10000 }
    );
    await this.page.click('button:has-text("Search")');
    await resp.catch(() => {});
  }

  async isReferenceInTable(refId: string) {
    return this.page.locator(`.oxd-table-card:has-text("${refId}")`).isVisible().catch(() => false);
  }
}
