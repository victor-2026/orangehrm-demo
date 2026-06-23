import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginPage } from './LoginPage';

export class TimePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login() {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();
  }

  async goto() {
    await super.goto('/web/index.php/time/viewTimeModule');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async gotoMyTimesheet() {
    await super.goto('/web/index.php/time/viewMyTimesheet');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async gotoAttendance() {
    await super.goto('/web/index.php/time/displayAttendanceStatistics');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async gotoEmployeeTimesheets() {
    await super.goto('/web/index.php/time/viewEmployeeTimesheet');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async getPageHeading() {
    return this.page.textContent('.orangehrm-main-title');
  }

  async isTimesheetTableVisible() {
    return this.page.isVisible('.oxd-sheet');
  }

  async getCurrentTimesheetPeriod() {
    return this.page.textContent('.oxd-timesheet-card-header-period');
  }

  async isAttendanceTableVisible() {
    return this.page.isVisible('.oxd-table');
  }

  async getAttendanceDate() {
    return this.page.inputValue('input[name="attendanceDate"]');
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }

  async isTimesheetVisible() {
    return this.page.isVisible('.oxd-sheet');
  }

  async getPunchInStatus() {
    return this.page.textContent('.orangehrm-attendance-item');
  }
}
