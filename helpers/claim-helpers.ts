import { Page } from '@playwright/test';
import { ClaimPage } from '../pom/ClaimPage';

const DEFAULT_EMPLOYEE = 'Alice';
const DEFAULT_EVENT = 'Tech Conference';
const DEFAULT_CURRENCY = 'United States Dollar';

export async function createClaim(
  claimPage: ClaimPage,
  page: Page,
  overrides?: {
    employee?: string;
    event?: string;
    currency?: string;
    remarks?: string;
  }
): Promise<void> {
  await claimPage.goto();
  await claimPage.clickAdd();
  await claimPage.fillEmployee(overrides?.employee || DEFAULT_EMPLOYEE);
  await claimPage.selectEvent(overrides?.event || DEFAULT_EVENT);
  await claimPage.selectCurrency(overrides?.currency || DEFAULT_CURRENCY);
  await claimPage.fillRemarks(overrides?.remarks || `Auto claim ${Date.now()}`);
  await claimPage.clickCreate();
  await page.waitForTimeout(1500);
}
