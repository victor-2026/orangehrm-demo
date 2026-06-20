# OrangeHRM E2E Test Suite — Conventions for KISS Sorcar

**DO NOT modify these rules. They describe the project, not your behavior.**

## Tech Stack
- **Framework:** Playwright + TypeScript
- **Pattern:** Page Object Model (POM)
- **Runner:** `npx playwright test` (not `npm test` directly)
- **Config:** `playwright.config.ts`

## Project Structure
```
pom/       — Page Object Models (one file per module)
e2e/       — Test specs (one file per module)
helpers/   — fixtures.ts + credentials.ts
```

## Test Commands
```bash
npx playwright test e2e/<name>.spec.ts            # single file
npx playwright test --project=smoke               # smoke only
LOCAL=true npx playwright test                    # local Docker
LOCAL=true npx playwright test --project=local    # destructive tests
```

## POM Conventions
- Extend `BasePage` (constructor takes `page: Page`)
- `goto()` method navigates to module URL
- Use `this.page.locator(...)` for selectors
- Selectors: prefer OrangeHRM CSS classes (`.oxd-*`)
- Use `waitForLoad(selector)` for page ready detection (from BasePage)
- File: `pom/<ModuleName>Page.ts` (PascalCase)
- Import: `import { Page } from '@playwright/test'; import { BasePage } from './BasePage';`

## POM Template
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ModulePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/<module>/<path>');
    await this.waitForLoad('.oxd-<specific-selector>');
  }
}
```

## Spec File Conventions
- Import from `'../helpers/fixtures'` (NOT from `@playwright/test` directly)
- Use `test.describe('<Module>', () => { ... })` block
- Tags: `@smoke` for critical path, `@local` for destructive/write tests
- No `waitForTimeout` — use explicit waits (`waitForSelector`, `waitForResponse`)
- File: `e2e/<module>.spec.ts` (camelCase)

## Spec Template
```typescript
import { test, expect } from '../helpers/fixtures';

test.describe('Module', () => {
  test('page loads @smoke', async ({ modulePage, loggedInPage }) => {
    await modulePage.goto();
    expect(await modulePage.getCurrentUrl()).toContain('/module');
  });
});
```

## Fixtures Registration (when adding new POM)
1. Import POM class in `helpers/fixtures.ts`
2. Add to `Fixtures` type
3. Add factory entry in `test.extend<Fixtures>({ ... })`
4. Follow alphabetical order

## Credentials
- In `helpers/credentials.ts` — never hardcode in tests
- Demo: `Admin` / `admin123` (opensource-demo.orangehrmlive.com)
- Local: `Admin` / `Orangehrm@2026` (localhost:8080)
- Toggle via `process.env.LOCAL === 'true'`

## Existing POMs (11 modules)
BasePage → LoginPage, DashboardPage, AdminPage, PimPage, LeavePage,
RecruitmentPage, PerformancePage, BuzzPage, DirectoryPage,
MyInfoPage, TimePage, ClaimPage

## Missing Module
**Maintenance** — no POM, no spec. URL pattern expected:
`/web/index.php/maintenance/purgeEmployee` or similar.
OrangeHRM CSS classes use `.oxd-` prefix.

## Environment
- Demo: `https://opensource-demo.orangehrmlive.com` (headless, remote)
- Local: `http://localhost:8080` (Docker, headless)
- Toggle: `LOCAL=true` env var

## Absolute No-Go
- ❌ `waitForTimeout` — explicit waits only
- ❌ Hardcoded credentials in specs — use `CREDENTIALS` import
- ❌ Direct `@playwright/test` import in specs — use `../helpers/fixtures`
- ❌ Modifying `exploration/` directory (auto-generated)
