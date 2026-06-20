# Maintenance Test Fixes

## Task
Fix 2 failing tests in e2e/maintenance.spec.ts as described:

1. **MAINT-002**: `getPurgeRecordsFormVisible()` checks selector with Employee Name text — this element does not exist after auth. Replace with a visible element from the Purge Records page.
2. **MAINT-003**: `getAuthenticationError()` looks for `.oxd-alert-content-text` — no error element appears with wrong password. The page just stays on password screen. Instead, check that password input still visible after wrong password.

## Changes Made

### 1. Updated `pom/MaintenancePage.ts`:
- Added `getPurgeRecordsFormVisible()` method that checks for "Purge Records" breadcrumb text (`.oxd-topbar-header-breadcrumb-level`) instead of "Employee Name" text which doesn't exist after authentication.
- Added `getAuthenticationError()` method that checks if password input (`input[type="password"]`) is still visible after wrong password, instead of looking for `.oxd-alert-content-text` error message which doesn't appear.
- Modified `enterPassword()` method to accept an optional `expectSuccess` parameter:
  - When `expectSuccess=true` (default): waits for URL change to `**/maintenance/purgeEmployee**`
  - When `expectSuccess=false`: clicks submit but doesn't wait for URL change, waits for password input to remain visible
- Removed duplicate `isPurgeRecordsPage()` method (functionality merged into `getPurgeRecordsFormVisible()`)
- Replaced `waitForTimeout(1000)` with explicit `waitForSelector('input[type="password"]', { state: 'visible' })` to follow best practices

### 2. Updated `e2e/maintenance.spec.ts`:
- **MAINT-002**: Updated to use `getPurgeRecordsFormVisible()` instead of `isPurgeRecordsPage()`
- **MAINT-003**: Added new test for wrong password authentication:
  - Enters wrong password with `expectSuccess=false`
  - Verifies password input remains visible using `getAuthenticationError()`

### 3. Test Results:
- All 3 tests pass: MAINT-001, MAINT-002, MAINT-003
- Tests run successfully with `LOCAL=true npx playwright test e2e/maintenance.spec.ts --project=chromium`
- No linting issues introduced

## Code Snippets

### MaintenancePage.ts key changes:
```typescript
async getPurgeRecordsFormVisible() {
  // Originally checked for "Employee Name" text which doesn't exist after auth
  // Now check for breadcrumb "Purge Records" which is visible
  const breadcrumb = this.page.locator('.oxd-topbar-header-breadcrumb-level');
  const text = await breadcrumb.textContent();
  return text?.trim() === 'Purge Records';
}

async getAuthenticationError() {
  // Instead of looking for .oxd-alert-content-text, check that password input is still visible
  // after wrong password (page stays on password screen)
  return this.page.locator('input[type="password"]').isVisible();
}

async enterPassword(password: string, expectSuccess = true) {
  await this.page.fill('input[type="password"]', password);
  if (expectSuccess) {
    await Promise.all([
      this.page.waitForURL('**/maintenance/purgeEmployee**'),
      this.page.click('button[type="submit"]'),
    ]);
  } else {
    // For wrong password, just click and don't wait for URL change
    await this.page.click('button[type="submit"]');
    // Wait for password input to be visible (page stays on password screen)
    await this.page.waitForSelector('input[type="password"]', { state: 'visible' });
  }
}
```

### maintenance.spec.ts key changes:
```typescript
test('MAINT-002: can enter admin password and see maintenance area @smoke', async ({ maintenancePage, loggedInPage }) => {
  await maintenancePage.goto();
  await maintenancePage.enterPassword(CREDENTIALS.admin.password, true);
  expect(await maintenancePage.getPurgeRecordsFormVisible()).toBe(true);
});

test('MAINT-003: wrong password shows authentication error @smoke', async ({ maintenancePage, loggedInPage }) => {
  await maintenancePage.goto();
  await maintenancePage.enterPassword('wrongpassword', false);
  // After wrong password, page should stay on password screen
  // Check that password input is still visible (not error message)
  expect(await maintenancePage.getAuthenticationError()).toBe(true);
});
```