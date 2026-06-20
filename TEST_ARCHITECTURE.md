# Test Architecture — OrangeHRM Demo

## Overview

E2E тестирование demo-версии OrangeHRM (HRMS) через Playwright + TypeScript.
Цель: покрыть 12 модулей системы тестами, обеспечить автоматизацию регрессии.

## Directory Structure

```
OrangeHRM/
├── e2e/                    — Test specs
│   ├── auth.spec.ts        — Authentication (4 tests)
│   ├── admin.spec.ts       — Admin User Management (3 tests)
│   ├── pim.spec.ts         — PIM Employee Management (3 tests)
│   ├── leave.spec.ts       — Leave Management (1 test)
│   ├── recruitment.spec.ts — Recruitment (3 tests)
│   ├── performance.spec.ts — Performance (1 test)
│   ├── buzz.spec.ts        — Buzz Social (2 tests)
│   ├── directory.spec.ts   — Directory (1 test)
│   ├── myinfo.spec.ts      — My Info Personal Details (3 tests)
│   ├── time.spec.ts        — Time Management (2 tests)
│   └── claim.spec.ts       — Claim Management (2 tests)
├── pom/                    — Page Object Models
│   ├── LoginPage.ts        — Login form interactions
│   ├── DashboardPage.ts    — Dashboard widgets + navigation
│   ├── AdminPage.ts        — Admin user CRUD
│   ├── PimPage.ts          — Employee CRUD
│   ├── LeavePage.ts        — Leave management
│   ├── RecruitmentPage.ts  — Candidate management
│   ├── PerformancePage.ts  — Performance reviews
│   ├── BuzzPage.ts         — Social feed
│   ├── DirectoryPage.ts    — Employee directory
│   ├── MyInfoPage.ts       — Personal details
│   ├── TimePage.ts         — Timesheet management
│   └── ClaimPage.ts        — Claim management
├── helpers/
│   ├── fixtures.ts         — Playwright fixtures (page objects)
│   └── credentials.ts      — Test accounts
├── exploration/            — Auto-generated site map
├── outputs/                — AI exploration logs
├── playwright.config.ts    — Test configuration
└── TEST_CASES.md           — 51 test cases, 43% coverage
```

## Traceability Matrix

| Тест-кейс | Модуль | Страница | POM | Файл |
|-----------|--------|----------|-----|------|
| AUTH-001 | Auth | Login | LoginPage | auth.spec.ts |
| AUTH-002 | Auth | Login | LoginPage | auth.spec.ts |
| AUTH-003 | Auth | Login | LoginPage | auth.spec.ts |
| DASH-001 | Dashboard | Index | DashboardPage | auth.spec.ts |
| ADMIN-001 | Admin | Users | AdminPage | admin.spec.ts |
| ADMIN-002 | Admin | Users | AdminPage | admin.spec.ts |
| ADMIN-003 | Admin | Users | AdminPage | admin.spec.ts |
| PIM-001 | PIM | Employee List | PimPage | pim.spec.ts |
| PIM-002 | PIM | Add Employee | PimPage | pim.spec.ts |
| PIM-003 | PIM | Employee List | PimPage | pim.spec.ts |
| RECR-001 | Recruitment | Candidates List | RecruitmentPage | recruitment.spec.ts |
| RECR-002 | Recruitment | Add Candidate | RecruitmentPage | recruitment.spec.ts |
| RECR-003 | Recruitment | Search Candidates | RecruitmentPage | recruitment.spec.ts |
| PERF-001 | Performance | Reviews List | PerformancePage | performance.spec.ts |
| DIR-001 | Directory | Employee Directory | DirectoryPage | directory.spec.ts |
| BUZZ-001 | Buzz | Buzz Feed | BuzzPage | buzz.spec.ts |
| LEAVE-001 | Leave | Leave List | LeavePage | leave.spec.ts |
| INFO-001 | My Info | Personal Details | MyInfoPage | myinfo.spec.ts |
| INFO-002 | My Info | Personal Details | MyInfoPage | myinfo.spec.ts |
| TIME-001 | Time | Timesheet | TimePage | time.spec.ts |
| TIME-002 | Time | Timesheet | TimePage | time.spec.ts |
| CLAIM-001 | Claim | Assign Claim | ClaimPage | claim.spec.ts |
| CLAIM-002 | Claim | Assign Claim | ClaimPage | claim.spec.ts |
| BUZZ-002 | Buzz | Create Post | BuzzPage | buzz.spec.ts |

## Module Coverage

| Модуль | POM | Тесты | Покрытие | Приоритет |
|--------|:---:|:-----:|:--------:|:---------:|
| Auth | ✅ | 4 | 38% | 🔴 |
| Dashboard | ✅ | 1 | 25% | 🔴 |
| Admin | ✅ | 3 | 43% | 🔴 |
| PIM | ✅ | 3 | 43% | 🔴 |
| Leave | ✅ | 1 | 20% | 🟡 |
| Time | ❌ | 0 | 0% | 🟡 |
| Recruitment | ✅ | 3 | 100% | 🟡 |
| My Info | ❌ | 0 | 0% | 🟡 |
| Performance | ✅ | 1 | 50% | 🟢 |
| Directory | ✅ | 1 | 50% | 🟢 |
| Maintenance | ❌ | 0 | 0% | 🟢 |
| Claim | ❌ | 0 | 0% | 🟢 |
| Buzz | ✅ | 2 | 33% | 🟢 |

## Test Patterns

### Page Object Model
```typescript
// pom/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto(`${BASE_URL}/auth/login`);
    await this.page.waitForSelector('.orangehrm-login-branding');
  }
  
  async login(username: string, password: string) {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}
```

### Fixture Pattern
```typescript
// helpers/fixtures.ts
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  loggedInPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAsAdmin();
    await use(login);
  },
});
```

### Data-Driven Pattern
```typescript
const USERS = [
  { role: 'Admin', name: 'John', status: 'Enabled' },
  { role: 'ESS', name: 'Jane', status: 'Enabled' },
];

for (const user of USERS) {
  test(`Add user: ${user.role}`, async ({ adminPage }) => {
    await adminPage.fillUserForm(user.role, user.name, user.username, user.password);
    expect(await adminPage.isUserInTable(user.name)).toBe(true);
  });
}
```

## Running Tests

```bash
npm test                    # Headless chromium
npm run test:headed         # Visible browser
npm run test:smoke          # Smoke tests only (@smoke tag)
npm run explore             # Re-generate site exploration
```

## CI/CD (Planned)

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npx playwright test --project=chromium
- name: Upload Report
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```
