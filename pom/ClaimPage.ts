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
    const input = this.page.locator('input[placeholder="Type for hints..."]').first();
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

  async searchClaims() {
    await this.page.locator('button:has-text("Search")').click();
    await this.page.waitForResponse(
      r => r.url().includes('/api/v2/claim') && r.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});
  }

  async resetSearch() {
    const btn = this.page.locator('button:has-text("Reset")');
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await this.page.waitForTimeout(500);
    }
  }

  async getClaimRowCount() {
    return this.page.locator('.oxd-table-card').count();
  }

  async openFirstClaimDetails() {
    const btn = this.page.locator('.oxd-table-card button.oxd-icon-button').first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await this.page.waitForTimeout(2000);
      return true;
    }
    return false;
  }

  async approveClaim() {
    const btn = this.page.locator('button:has-text("Approve")');
    if (!await btn.isVisible().catch(() => false)) return false;

    const resp = this.page.waitForResponse(
      r => r.url().includes('/api/v2/claim') && ['PUT', 'PATCH'].includes(r.request().method()),
      { timeout: 10000 }
    );
    await btn.click();
    await this.page.waitForTimeout(500);

    const confirmBtn = this.page.locator('button:has-text("Yes"), button:has-text("Confirm")');
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
    }

    const toastBtn = this.page.locator('button.oxd-toast-close, .oxd-toast button');
    if (await toastBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await toastBtn.click();
    }
    await resp.catch(() => {});
    return true;
  }

  async rejectClaim() {
    const btn = this.page.locator('button:has-text("Reject")');
    if (!await btn.isVisible().catch(() => false)) return false;

    const textarea = this.page.locator('textarea');
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill('Rejected - expense not covered');
    }

    const resp = this.page.waitForResponse(
      r => r.url().includes('/api/v2/claim') && ['PUT', 'PATCH'].includes(r.request().method()),
      { timeout: 10000 }
    );
    await this.page.click('button[type="submit"]');

    const toastBtn = this.page.locator('button.oxd-toast-close, .oxd-toast button');
    if (await toastBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await toastBtn.click();
    }
    await resp.catch(() => {});
    return true;
  }

  async isApproveButtonVisible() {
    return this.page.locator('button:has-text("Approve")').isVisible().catch(() => false);
  }

  async isRejectButtonVisible() {
    return this.page.locator('button:has-text("Reject")').isVisible().catch(() => false);
  }
}
