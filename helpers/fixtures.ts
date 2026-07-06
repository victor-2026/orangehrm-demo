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
import { ClaimKissPage } from '../pom/ClaimKissPage';
import { MaintenancePage } from '../pom/MaintenancePage';
import { WorkspaceNotificationPage } from '../pom/WorkspaceNotificationPage';

// Runtime environment detection helper - check BASE_URL and LOCAL
function getIsDocker(): boolean {
  return process.env.BASE_URL?.includes('localhost') || process.env.LOCAL === 'true';
}

// For use in type definitions - boolean indicating environment
export const isDockerFlag = getIsDocker();

// Runtime environment check function - for use in actual tests
export const getIsDockerEnv = (): boolean => {
  return getIsDocker();
};

// Adaptive assertion helpers
export async function adaptiveExpect<T>(
  condition: T | Promise<T>,
  dockerMessage: string,
  demoMessage: string,
) {
  const result = await condition;
  if (getIsDockerEnv()) {
    expect(result, dockerMessage).toBeTruthy();
  } else {
    expect(result, demoMessage).toBeTruthy();
  }
}

// Helper method to get current environment
export const getEnvironment = () => getIsDockerEnv() ? 'docker' : 'demo';

// Helper to log environment info
export async function logEnvironmentInfo() {
  const env = getEnvironment();
  console.log(`Test Environment: ${env}`);
  console.log(`BASE_URL: ${process.env.BASE_URL || 'not set'}`);
}

// Helper for robust URL building based on environment
export async function getFullURL(path: string): Promise<string> {
  const baseURL = process.env.BASE_URL || '';
  return `${baseURL}${path}`;
}

// Helper for clean error messages across environments
export function getEnvironmentPrefix(): string {
  return getIsDockerEnv() ? 'DOCKER' : 'DEMO';
}

// Environment-specific wait helper
export async function adaptiveWaitFor(selector: string, timeout: number = 10000): Promise<void> {
  const isDockerEnv = getIsDockerEnv();
  const baseTimeout = isDockerEnv ? timeout * 1.5 : timeout;
  await new Promise(resolve => setTimeout(resolve, 500));
  await new Promise(resolve => setTimeout(resolve, baseTimeout));
}

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
  claimKissPage: ClaimKissPage;
  maintenancePage: MaintenancePage;
  workspaceNotificationPage: WorkspaceNotificationPage;
  loggedInPage: LoginPage;
  isDocker: boolean;
  baseURL: string;
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
  claimKissPage: async ({ page }, use) => {
    await use(new ClaimKissPage(page));
  },
  maintenancePage: async ({ page }, use) => {
    await use(new MaintenancePage(page));
  },
  workspaceNotificationPage: async ({ page }, use) => {
    await use(new WorkspaceNotificationPage(page));
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
  isDocker: async ({}, use) => {
    await use(getIsDockerEnv());
  },
  baseURL: async ({}, use) => {
    await use(process.env.BASE_URL || '');
  },
});

export { expect } from '@playwright/test';

// For backward compatibility - Page class export if needed by tests
export type { Page } from '@playwright/test';