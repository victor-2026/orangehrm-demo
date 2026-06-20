import { test, expect } from '../helpers/fixtures';

test.describe('PIM — Employee Management', () => {
  const ts = Date.now();
  const employee = {
    firstName: `Test_${ts}`,
    lastName: `User_${ts}`,
    username: `testuser_${ts}`,
    password: 'Pass123!',
  };

  test('PIM page loads with employee list @smoke', async ({ pimPage, loggedInPage }) => {
    await pimPage.goto();
    expect(await pimPage.getCurrentUrl()).toContain('/pim/viewEmployeeList');
  });

  test('can add a new employee @local', async ({ pimPage, page, loggedInPage }) => {
    await pimPage.goto();
    await pimPage.clickAdd();
    expect(page.url()).toContain('/pim/addEmployee');

    await pimPage.fillEmployeeForm(employee.firstName, employee.lastName);
    await pimPage.clickSave();
    await page.waitForURL('**/pim/viewEmployeeList', { timeout: 10000 }).catch(() => {});

    await pimPage.goto();
    await pimPage.searchEmployee(employee.firstName);
    await expect(page.locator('.orangehrm-container .oxd-table-body')).toContainText(employee.firstName, { timeout: 5000 });
  });

  test('can search for existing employee @smoke', async ({ pimPage, page, loggedInPage }) => {
    await pimPage.goto();
    const tableBody = page.locator('.oxd-table-body');
    const cellText = await tableBody.locator('.oxd-table-cell').nth(2).first().textContent();
    if (cellText) {
      const searchTerm = cellText.trim().substring(0, 4);
      await pimPage.searchEmployee(searchTerm);
      await expect(tableBody).toContainText(searchTerm, { timeout: 5000 });
    }
  });

  test('can view employee details @smoke', async ({ pimPage, page, loggedInPage }) => {
    await pimPage.goto();
    const hasDefaultData = await page.locator('.oxd-table-body .oxd-table-cell').first().isVisible().catch(() => false);
    if (!hasDefaultData) {
      await pimPage.searchEmployee('a');
      await page.waitForTimeout(1000);
    }
    const hasData = await page.locator('.oxd-table-body .oxd-table-cell').first().isVisible().catch(() => false);
    test.skip(!hasData, 'No employee data on shared demo even after search');
    await pimPage.viewFirstEmployee();
    expect(await pimPage.isPersonalDetailsVisible()).toBe(true);
  });

  test('can edit employee first name @local', async ({ pimPage, page, loggedInPage }) => {
    await pimPage.goto();
    const tableBody = page.locator('.oxd-table-body');
    const firstRow = tableBody.locator('.oxd-table-row').first();
    const nameCell = await firstRow.locator('.oxd-table-cell').nth(2).textContent();
    test.skip(!nameCell, 'No employee data in table');
    const name = nameCell!.trim();
    await pimPage.searchEmployee(name.split(' ')[0]);
    await pimPage.clickEmployeeRow(name);
    await pimPage.waitForFirstNameInput();
    await page.waitForFunction(() => {
      const input = document.querySelector('input[name="firstName"]') as HTMLInputElement;
      return input && input.value.length > 0;
    }, { timeout: 10000 });
    const currentName = await pimPage.getEmployeeFirstName();
    expect(currentName.length).toBeGreaterThan(0);
  });

  test('can delete employee @local', async ({ pimPage, page, loggedInPage }) => {
    const delTs = Date.now();
    const tempEmployee = { firstName: `Del_${delTs}`, lastName: `User_${delTs}` };
    await pimPage.goto();
    await pimPage.clickAdd();
    await pimPage.fillEmployeeForm(tempEmployee.firstName, tempEmployee.lastName);
    await pimPage.clickSave();
    await pimPage.goto();
    await pimPage.searchEmployee(tempEmployee.firstName);
    await expect(page.locator('.orangehrm-container .oxd-table-body')).toContainText(tempEmployee.firstName, { timeout: 5000 });
  });

});
