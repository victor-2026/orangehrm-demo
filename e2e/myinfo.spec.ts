import { test, expect } from '../helpers/fixtures';

test.describe('My Info', () => {
  test('personal details page loads @smoke', async ({ myInfoPage, loggedInPage }) => {
    await myInfoPage.goto();
    const heading = await myInfoPage.getHeading();
    expect(heading).toMatch(/Personal Details|PIM/i);
  });

  test('can view first and last name', async ({ myInfoPage, loggedInPage }) => {
    await myInfoPage.goto();
    await myInfoPage.waitForFirstNameInput();
    const firstName = await myInfoPage.getFirstName();
    const lastName = await myInfoPage.getLastName();
    expect(firstName.length).toBeGreaterThan(0);
    expect(lastName.length).toBeGreaterThan(0);
  });

  test('can edit personal details', async ({ myInfoPage, page, loggedInPage }) => {
    await myInfoPage.goto();
    await myInfoPage.waitForFirstNameInput();
    const originalFirst = await myInfoPage.getFirstName();
    const testValue = `Test_${Date.now()}`;
    const empIdInput = page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input');
    const uniqueEmpId = `T${Date.now()}`.slice(0, 10);
    await empIdInput.fill(uniqueEmpId);
    await myInfoPage.editFirstName(testValue);
    await myInfoPage.clickSave();
    await myInfoPage.goto();
    await myInfoPage.waitForFirstNameInput();
    const updatedFirst = await myInfoPage.getFirstName();
    expect(updatedFirst).toBe(testValue);
    const restoreEmpId = `R${Date.now()}`.slice(0, 10);
    await empIdInput.fill(restoreEmpId);
    await myInfoPage.editFirstName(originalFirst);
    await myInfoPage.clickSave();
  });

  test('contact details page loads @smoke', async ({ myInfoPage, loggedInPage }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Contact Details');
    expect(await myInfoPage.getCurrentUrl()).toContain('contactDetails');
    expect(await myInfoPage.isPageHeadingVisible()).toBe(true);
  });

  test('emergency contacts page loads @smoke', async ({ myInfoPage, loggedInPage }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Emergency Contacts');
    expect(await myInfoPage.getCurrentUrl()).toContain('viewEmergencyContacts');
  });

  test('dependents page loads @smoke', async ({ myInfoPage, loggedInPage }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Dependents');
    expect(await myInfoPage.getCurrentUrl()).toContain('viewDependents');
  });

  test('job page loads @smoke', async ({ myInfoPage, loggedInPage }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Job');
    expect(await myInfoPage.getCurrentUrl()).toContain('viewJobDetails');
  });

  test('salary page loads @smoke', async ({ myInfoPage, loggedInPage }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Salary');
    expect(await myInfoPage.getCurrentUrl()).toContain('viewSalaryList');
  });

  test('qualifications page loads @smoke', async ({ myInfoPage, loggedInPage }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Qualifications');
    expect(await myInfoPage.getCurrentUrl()).toContain('viewQualifications');
  });
});
