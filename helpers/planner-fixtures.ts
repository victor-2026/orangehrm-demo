import { test as base, expect } from '../helpers/fixtures';
import { LoginPage } from '../pom/LoginPage';
import { AdminPage } from '../pom/AdminPage';

type PlannerFixtures = {
  adminSession: LoginPage;
  authenticatedSession: LoginPage;
};

export const seed = base.extend<PlannerFixtures>({
  adminSession: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAsAdmin();
    await use(login);
  },

  authenticatedSession: async ({ adminSession }, use) => {
    await use(adminSession);
  },
});

export async function setupAdminTestData(adminPage: AdminPage): Promise<void> {
  await adminPage.goto();
  const userCount = await adminPage.getTableRows();
  if (userCount === 0) {
    throw new Error('No user data available for planning - check fresh instance');
  }
}

export async function setupPlanningEnvironment(adminPage: AdminPage): Promise<{ users: Array<{ username: string; userRole: string; employeeName: string; status: string }>; role: string }> {
  await adminPage.goto();
  const userCount = await adminPage.getTableRows();
  const users: Array<{ username: string; userRole: string; employeeName: string; status: string }> = [];

  for (let i = 0; i < Math.min(userCount, 10); i++) {
    const rowData = await adminPage.getRowData(i);
    users.push({
      username: rowData[1],
      userRole: rowData[2],
      employeeName: rowData[3],
      status: rowData[4],
    });
  }

  return { users, role: 'admin' };
}

export async function planNavigationScenarios(adminPage: AdminPage): Promise<Array<{ tab: string; hasSubTabs: boolean }>> {
  const tabs = await adminPage.getTopbarTabs();
  const navigationScenarios: Array<{ tab: string; hasSubTabs: boolean }> = [];

  for (const tab of tabs) {
    navigationScenarios.push({
      tab,
      hasSubTabs: tab !== 'Nationalities' && tab !== 'Corporate Branding',
    });
  }

  return navigationScenarios;
}

export { expect };
