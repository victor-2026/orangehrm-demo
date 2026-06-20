# OrangeHRM Demo — E2E Test Suite

Playwright E2E + API тесты для [OrangeHRM](https://opensource-demo.orangehrmlive.com) — open-source HRMS системы. **TypeScript + Python.**

## Stack

- **Playwright** — E2E + API тесты (TypeScript + Python)
- **Page Object Model** — поддерживаемость локаторов
- **Allure TestOps** — централизованный test management + CI/CD интеграция
- **pytest + playwright-python** — Python API/Smoke тесты (7 tests)
- **GitHub Actions** — CI/CD + Allure upload

## Quick Start

### Option 1: Demo (shared)
```bash
npm install
npx playwright install
npm test                    # headless chromium (TypeScript)
npm run test:smoke          # smoke tests only
npm run test:python         # Python tests (pytest + playwright)
```

### Option 2: Local Docker (recommended)
```bash
docker compose -f outputs/local-deployment.yml up -d
# Wait 2 minutes, then:
npm install
npx playwright install
npm test
```

## Project Structure

```
OrangeHRM/
├── e2e/                — 12 spec files (~200+ tests)
├── pom/                — 12 Page Object Models
├── python_api_tests/   — Python tests (pytest + playwright)
│   ├── conftest.py     — Fixtures, auth, browser setup
│   ├── test_auth.py    — 4 auth tests
│   └── test_pim.py     — 3 PIM tests
├── helpers/            — Fixtures, credentials
├── scripts/            — Utility scripts
├── TEST_CASES.md       — 51 test cases, 53% coverage
├── TEST_ARCHITECTURE.md — Traceability matrix + patterns
└── playwright.config.ts — Dual-target config
```

## Modules Covered

| Module | POM | Tests | Status |
|--------|:---:|:-----:|:------:|
| Auth | ✅ | 2 | ✅ |
| Dashboard | ✅ | 3 | ✅ |
| Admin | ✅ | 3 | ✅ |
| PIM | ✅ | 5 | ✅ |
| Leave | ✅ | 2 | ✅ |
| Buzz | ✅ | 2 | ✅ |
| Recruitment | ✅ | 3 | ✅ |
| Performance | ✅ | 1 | ✅ |
| Directory | ✅ | 1 | ✅ |
| My Info | ✅ | 1 | ✅ |
| Time | ✅ | 1 | ✅ |
| Claim | ✅ | 1 | ✅ |

## Python Tests

```bash
npm run test:python           # 7 tests (auth + PIM)
npm run test:python:allure    # with Allure report
```

See [python_api_tests/](python_api_tests/) for full source.

## Reporting

Allure HTML-отчёт + Allure TestOps (CI/CD):
```bash
npm run test:allure           # run + generate + open
```

## Links

- **GitHub:** https://github.com/victor-2026/orangehrm-demo
- **Demo:** https://opensource-demo.orangehrmlive.com
- **Allure TestOps:** https://victor2026.testops.cloud/project/1
