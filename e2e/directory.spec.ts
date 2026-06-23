import { test, expect } from '../helpers/fixtures';

test.describe('Directory', () => {
  test('directory page loads @smoke', async ({ directoryPage, loggedInPage }) => {
    await directoryPage.goto();
    expect(await directoryPage.getCurrentUrl()).toContain('/directory');
  });

  test('directory search form visible @smoke', async ({ directoryPage, loggedInPage }) => {
    await directoryPage.goto();
    const fields = await directoryPage.getSearchFormFields();
    expect(fields).toContain('Employee Name');
    expect(fields).toContain('Job Title');
    expect(fields).toContain('Location');
  });

  test('directory loads results @smoke', async ({ directoryPage, loggedInPage }) => {
    await directoryPage.goto();
    const resultsVisible = await directoryPage.isResultsVisible();
    test.skip(!resultsVisible, 'No directory results on this instance');
    const count = await directoryPage.getEmployeeCount();
    expect(count).toBeGreaterThan(0);
    const names = await directoryPage.getResultNames();
    expect(names.length).toBe(count);
  });

  test('directory page loads @local', async ({ directoryPage, loggedInPage }) => {
    await directoryPage.goto();
    expect(await directoryPage.getCurrentUrl()).toContain('/directory');
  });

  test('directory search form visible @local', async ({ directoryPage, loggedInPage }) => {
    await directoryPage.goto();
    const fields = await directoryPage.getSearchFormFields();
    expect(fields).toContain('Employee Name');
    expect(fields).toContain('Job Title');
    expect(fields).toContain('Location');
  });

  test('directory loads results @local', async ({ directoryPage, loggedInPage }) => {
    await directoryPage.goto();
    const resultsVisible = await directoryPage.isResultsVisible();
    if (resultsVisible) {
      const count = await directoryPage.getEmployeeCount();
      expect(count).toBeGreaterThan(0);
    }
  });
});
