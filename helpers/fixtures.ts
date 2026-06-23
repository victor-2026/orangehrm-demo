import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pom/LoginPage';
import { DashboardPage } from '../pom/DashboardPage';
import { AdminPage } from '../pom/AdminPage';
import { PimPage } from '../pom/PimPage';
import { LeavePage } from '../pom/LeavePage';
import { RecruitmentPage } from '../pom/RecruitmentPage';
import { PerformancePage } from '../pom/PerformancePage';
import { BuzzPage } from '../pom/BuzzPage';
import { DirectoryPage } from '../pom/DirectoryPage';
import { MyInfoPage } from '../pom/MyInfoPage';
import { TimePage } from '../pom/TimePage';
import { ClaimPage } from '../pom/ClaimPage';
import { MaintenancePage } from '../pom/MaintenancePage';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  adminPage: AdminPage;
  pimPage: PimPage;
  leavePage: LeavePage;
  recruitmentPage: RecruitmentPage;
  performancePage: PerformancePage;
  buzzPage: BuzzPage;
  directoryPage: DirectoryPage;
  myInfoPage: MyInfoPage;
  timePage: TimePage;
  claimPage: ClaimPage;
  maintenancePage: MaintenancePage;
  loggedInPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  pimPage: async ({ page }, use) => {
    await use(new PimPage(page));
  },
  leavePage: async ({ page }, use) => {
    await use(new LeavePage(page));
  },
  recruitmentPage: async ({ page }, use) => {
    await use(new RecruitmentPage(page));
  },
  performancePage: async ({ page }, use) => {
    await use(new PerformancePage(page));
  },
  buzzPage: async ({ page }, use) => {
    await use(new BuzzPage(page));
  },
  directoryPage: async ({ page }, use) => {
    await use(new DirectoryPage(page));
  },
  myInfoPage: async ({ page }, use) => {
    await use(new MyInfoPage(page));
  },
  timePage: async ({ page }, use) => {
    await use(new TimePage(page));
  },
  claimPage: async ({ page }, use) => {
    await use(new ClaimPage(page));
  },
  maintenancePage: async ({ page }, use) => {
    await use(new MaintenancePage(page));
  },
  loggedInPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    if (await page.locator('input[name="username"]').isVisible().catch(() => false)) {
      await base.step('Login as admin', async () => {
        await login.loginAsAdmin();
      });
    }
    await use(login);
  },
});

export { expect } from '@playwright/test';