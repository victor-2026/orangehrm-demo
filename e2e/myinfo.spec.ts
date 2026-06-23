import { test, expect } from '../helpers/fixtures';

test.describe('My Info', () => {
  test('personal details page loads @smoke', async ({ myInfoPage, loggedInPage }) => {
    await myInfoPage.goto();
    const heading = await myInfoPage.getHeading();
    expect(heading).toMatch(/Personal Details|PIM/i);
  });

  test('personal details shows first and last name @local', async ({ myInfoPage }) => {
    await myInfoPage.goto();
    const firstName = await myInfoPage.getFirstName();
    const lastName = await myInfoPage.getLastName();
    expect(firstName.length).toBeGreaterThan(0);
    expect(lastName.length).toBeGreaterThan(0);
  });

  test('contact details page loads @smoke', async ({ myInfoPage, page, loggedInPage }) => {
    await page.goto('/web/index.php/pim/contactDetails/empNumber/1');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('contactDetails');
  });

  test('contact details navigation @local', async ({ myInfoPage, page }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Contact Details');
    expect(page.url()).toContain('contactDetails');
  });

  test('emergency contacts page loads @smoke', async ({ myInfoPage, page, loggedInPage }) => {
    await page.goto('/web/index.php/pim/viewEmergencyContacts/empNumber/1');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('viewEmergencyContacts');
  });

  test('emergency contacts navigation @local', async ({ myInfoPage, page }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Emergency Contacts');
    expect(page.url()).toContain('viewEmergencyContacts');
  });

  test('dependents page loads @smoke', async ({ myInfoPage, page, loggedInPage }) => {
    await page.goto('/web/index.php/pim/viewDependents/empNumber/1');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('viewDependents');
  });

  test('dependents navigation @local', async ({ myInfoPage, page }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Dependents');
    expect(page.url()).toContain('viewDependents');
  });

  test('job page loads @smoke', async ({ myInfoPage, page, loggedInPage }) => {
    await page.goto('/web/index.php/pim/viewJobDetails/empNumber/1');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('viewJobDetails');
  });

  test('job tab navigation @local', async ({ myInfoPage, page }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Job');
    expect(page.url()).toContain('viewJobDetails');
  });

  test('salary page loads @smoke', async ({ myInfoPage, page, loggedInPage }) => {
    await page.goto('/web/index.php/pim/viewSalaryList/empNumber/1');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('viewSalaryList');
  });

  test('salary tab navigation @local', async ({ myInfoPage, page }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Salary');
    expect(page.url()).toContain('viewSalaryList');
  });

  test('qualifications page loads @smoke', async ({ myInfoPage, page, loggedInPage }) => {
    await page.goto('/web/index.php/pim/viewQualifications/empNumber/1');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('viewQualifications');
  });

  test('qualifications tab navigation @local', async ({ myInfoPage, page }) => {
    await myInfoPage.goto();
    await myInfoPage.clickSubTab('Qualifications');
    expect(page.url()).toContain('viewQualifications');
  });
});
