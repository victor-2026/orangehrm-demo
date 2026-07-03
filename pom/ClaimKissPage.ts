import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ClaimKissPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoAssignClaim() {
    await super.goto('/web/index.php/claim/viewAssignClaim');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async fillEmployee(name: string) {
    const input = this.page.locator('input[placeholder="Type for hints..."]').first();
    await input.click();
    await input.pressSequentially(name, { delay: 80 });
    await this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option').first().waitFor({ timeout: 5000 }).catch(() => {});
    await this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option').first().click();
  }

  async selectEvent(name: string) {
    await this.page.locator('.oxd-select-text-input').nth(0).click();
    await this.page.locator(`.oxd-select-option:has-text("${name}")`).click();
  }

  async selectCurrency(name: string) {
    await this.page.locator('.oxd-select-text-input').nth(1).click();
    await this.page.locator(`.oxd-select-option:has-text("${name}")`).click();
  }

  async fillRemarks(text: string) {
    await this.page.locator('textarea').fill(text);
  }

  async clickCreate() {
    const resp = this.page.waitForResponse(
      r => r.url().includes('/api/v2/claim/') && r.request().method() === 'POST',
      { timeout: 10000 }
    );
    await this.page.locator('button[type="submit"]').click();
    await resp;
  }

  async clickApprove() {
    const resp = this.page.waitForResponse(
      r => r.url().includes('/api/v2/claim/') && ['PUT', 'PATCH'].includes(r.request().method()),
      { timeout: 10000 }
    );
    await this.page.locator('button:has-text("Approve")').click();
    const confirmBtn = this.page.locator('button:has-text("Yes"), button:has-text("Confirm")');
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
    }
    await resp;
  }

  async gotoEmployeeClaims() {
    const link = this.page.locator('a:has-text("Employee Claims")');
    if (await link.isVisible().catch(() => false)) {
      await link.click();
    } else {
      await super.goto('/web/index.php/claim/viewEmployeeClaims');
    }
    await this.page.waitForLoadState('networkidle');
  }

  async gotoMyClaims() {
    await super.goto('/web/index.php/claim/viewClaim');
    await this.page.waitForLoadState('networkidle');
  }

  async searchByEmployee(name: string) {
    const input = this.page.locator('input[placeholder="Type for hints..."]').first();
    await input.click();
    await input.pressSequentially(name, { delay: 80 });
    await this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option').first().waitFor({ timeout: 5000 }).catch(() => {});
    await this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option').first().click();
    await this.page.locator('button:has-text("Search")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async getToastMessage(): Promise<string> {
    const toast = this.page.locator('.oxd-toast, .oxd-text--toast-title').first();
    return (await toast.textContent().catch(() => ''))?.trim() ?? '';
  }

  async isClaimInTable(text: string): Promise<boolean> {
    return this.page.locator('.oxd-table-body').locator(`text=${text}`).isVisible().catch(() => false);
  }

  async isStatusVisible(status: string): Promise<boolean> {
    return this.page.locator(`.oxd-table-body text=${status}`).isVisible().catch(() => false);
  }
}
