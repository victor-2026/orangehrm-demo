import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pom/LoginPage';

// API seed for suites that assume demo-like data (fresh installs are empty).
// Idempotent: check-then-create. Skipped on LOCAL (local docker has its own dataset).
// Runs in the `setup` project before smoke/chromium suites.

const EMP_FIRST = 'Alice';
const EMP_LAST = 'Administrator';
const EVENT_NAME = 'Tech Conference';

async function apiList(page: any, url: string): Promise<any[]> {
  const res = await page.request.get(url);
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body.data ?? [];
}

setup('seed prerequisite data via API', async ({ page }) => {
  if (process.env.LOCAL === 'true') return;
  setup.setTimeout(180000);

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  // Session from a previous setup run may still be valid
  if (await loginPage.isLoginFormVisible()) {
    await loginPage.loginAsAdmin();
  }
  await expect(page.locator('.oxd-topbar-header-title')).toContainText('Dashboard', {
    timeout: 30000,
  });

  // 1. Employee Alice Administrator
  const employees = await apiList(page, '/web/index.php/api/v2/pim/employees?limit=100');
  let alice = employees.find((e: any) => e.firstName === EMP_FIRST && e.lastName === EMP_LAST);
  if (!alice) {
    const res = await page.request.post('/web/index.php/api/v2/pim/employees', {
      data: { firstName: EMP_FIRST, middleName: '', lastName: EMP_LAST },
    });
    expect(res.status()).toBe(200);
    alice = (await res.json()).data;
  }

  // 2. Claim event Tech Conference
  const events = await apiList(page, '/web/index.php/api/v2/claim/events?limit=100');
  let event = events.find((e: any) => e.name === EVENT_NAME);
  if (!event) {
    const res = await page.request.post('/web/index.php/api/v2/claim/events', {
      data: { name: EVENT_NAME, status: true },
    });
    expect(res.status()).toBe(200);
    event = (await res.json()).data;
  }

  // 3. At least one claim for Alice (search/list tests need rows)
  const reqList = await page.request.get('/web/index.php/api/v2/claim/employees/requests?limit=1');
  expect(reqList.status()).toBe(200);
  const total = (await reqList.json()).meta?.total ?? 0;
  if (total === 0) {
    const res = await page.request.post(
      `/web/index.php/api/v2/claim/employees/${alice.empNumber}/requests`,
      { data: { claimEventId: event.id, currencyId: 'USD', remarks: 'seed claim' } }
    );
    expect(res.status()).toBe(200);
  }

  // 4. User account for Alice (leave flow logs in as employee)
  const users = await apiList(page, '/web/index.php/api/v2/admin/users?limit=100');
  if (!users.some((u: any) => u.userName === 'alice')) {
    const res = await page.request.post('/web/index.php/api/v2/admin/users', {
      data: {
        username: 'alice',
        password: 'AlicePass123!',
        userRoleId: 2,
        empNumber: alice.empNumber,
        status: true,
      },
    });
    expect(res.status()).toBe(200);
  }

  // 5. Leave chain for Alice: period + Annual type + entitlement + one pending request
  await page.request.put('/web/index.php/api/v2/leave/leave-period', {
    data: { startMonth: 1, startDay: 1 },
  });
  const types = await apiList(page, '/web/index.php/api/v2/leave/leave-types?limit=100');
  let leaveType = types.find((t: any) => t.name === 'Annual');
  if (!leaveType) {
    const res = await page.request.post('/web/index.php/api/v2/leave/leave-types', {
      data: { name: 'Annual', situational: false },
    });
    expect(res.status()).toBe(200);
    leaveType = (await res.json()).data;
  }
  const entRes = await page.request.get(
    `/web/index.php/api/v2/leave/employees/${alice.empNumber}/leave-entitlements?leaveTypeId=${leaveType.id}`
  );
  expect(entRes.status()).toBe(200);
  const balance = (await entRes.json()).data?.entitlement?.current ?? 0;
  if (balance < 5) {
    const res = await page.request.post('/web/index.php/api/v2/leave/leave-entitlements', {
      data: {
        empNumber: alice.empNumber,
        leaveTypeId: leaveType.id,
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        entitlement: 10,
      },
    });
    expect(res.status()).toBe(200);
  }
});
