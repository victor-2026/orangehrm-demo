import { test, expect } from '../helpers/fixtures';

test.describe('PIM Employee List — Fault Injection (with skill)', () => {
  test('injects null into emp_firstname via page.route() and verifies mutation is caught', async ({ pimPage, page, loggedInPage }) => {
    // Intercept the Employee List API response (skill pattern: page.route with fetch/fulfill)
    await page.route('**/api/v2/pim/employees**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      
      // Skill pattern: null injection in required field
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach((emp: any) => {
          emp.emp_firstname = null;
        });
      } else if (json.employees && Array.isArray(json.employees)) {
        json.employees.forEach((emp: any) => {
          emp.emp_firstname = null;
        });
      }
      
      await route.fulfill({
        response,
        json,
      });
    });

    await pimPage.goto();
    
    // Wait for table to load with mutated data
    await page.waitForTimeout(2000);
    
    const tableBody = page.locator('.oxd-table-body');
    
    // Skill pattern: Verify mutation is caught - check for error/empty state
    // The test SHOULD FAIL because mutation is caught (UI shows error/empty)
    const firstNameCell = tableBody.locator('.oxd-table-cell').nth(2); // Assuming 3rd column is first name
    const firstNameText = await firstNameCell.first().textContent();
    
    // Skill pattern: explicit assertion that mutation is caught
    // This SHOULD FAIL (test fails = mutation caught)
    expect(firstNameText).not.toBeNull();
    expect(firstNameText).not.toBe('');
    expect(firstNameText).not.toBe('null');
  });

  test('HOM: null emp_firstname + negative emp_number via page.route()', async ({ pimPage, page, loggedInPage }) => {
    // Skill HOM pattern: combine multiple mutations
    await page.route('**/api/v2/pim/employees**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach((emp: any) => {
          emp.emp_firstname = null;           // null in required field
          emp.emp_number = -999;              // negative/extreme value
        });
      } else if (json.employees && Array.isArray(json.employees)) {
        json.employees.forEach((emp: any) => {
          emp.emp_firstname = null;
          emp.emp_number = -999;
        });
      }
      
      await route.fulfill({
        response,
        json,
      });
    });

    await pimPage.goto();
    await page.waitForTimeout(2000);
    
    const tableBody = page.locator('.oxd-table-body');
    const firstNameCell = tableBody.locator('.oxd-table-cell').nth(2);
    const firstNameText = await firstNameCell.first().textContent();
    
    // Skill HOM pattern: both mutations should be caught
    expect(firstNameText).not.toBeNull();
    expect(firstNameText).not.toBe('');
    expect(firstNameText).not.toBe('null');
  });
});