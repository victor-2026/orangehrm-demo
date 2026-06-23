import { test, expect } from '../helpers/fixtures';

test.describe('Recruitment', () => {
  const ts = Date.now();
  const candidate = {
    firstName: `Phase2_${ts}`,
    lastName: `Candidate_${ts}`,
    email: `candidate_${ts}@test.com`,
  };

  test('candidates page loads @smoke', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.goto();
    const heading = await recruitmentPage.getHeading();
    expect(heading).toContain('Recruitment');
  });

  test('can add a new candidate @smoke', async ({ recruitmentPage, page, loggedInPage }) => {
    await recruitmentPage.goto();
    await recruitmentPage.clickAdd();
    expect(page.url()).toContain('/addCandidate');

    await recruitmentPage.fillCandidateForm(candidate.firstName, candidate.lastName, candidate.email);
    await recruitmentPage.clickSave();

    await recruitmentPage.goto();
    await recruitmentPage.searchCandidate(candidate.firstName);
    await expect(page.locator('.oxd-table-body')).toContainText(candidate.firstName);
  });

  test('can search for candidates @smoke', async ({ recruitmentPage, page, loggedInPage }) => {
    await recruitmentPage.goto();
    const recordCount = await recruitmentPage.getRecordCount();
    test.skip(recordCount === 0, 'No candidates on fresh instance');
    const nameCell = page.locator('.oxd-table-body .oxd-table-cell').nth(1);
    const cellText = await nameCell.textContent();
    if (cellText) {
      const term = cellText.trim().substring(0, 4);
      await recruitmentPage.searchCandidate(term);
    }
  });

  test('vacancies page loads @smoke', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.gotoVacancies();
    expect(await recruitmentPage.getCurrentUrl()).toContain('/recruitment/viewJobVacancy');
    const heading = await recruitmentPage.getHeading();
    expect(heading).toContain('Recruitment');
  });

  test('candidates search form visible @smoke', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.goto();
    const fields = await recruitmentPage.getSearchFormFields();
    expect(fields.length).toBeGreaterThanOrEqual(3);
    expect(fields).toContain('Job Title');
    expect(fields).toContain('Vacancy');
  });

  test('vacancies table visible @smoke', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.gotoVacancies();
    const tableVisible = await recruitmentPage.isTableVisible();
    expect(tableVisible).toBe(true);
  });

  test('recruitment topbar tabs visible @smoke', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.goto();
    const tabs = await recruitmentPage.getTopbarTabs();
    expect(tabs).toContain('Candidates');
    expect(tabs).toContain('Vacancies');
  });

  test('candidates page loads @local', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.goto();
    expect(await recruitmentPage.getCurrentUrl()).toContain('/recruitment/viewCandidates');
    const heading = await recruitmentPage.getHeading();
    expect(heading).toContain('Recruitment');
  });

  test('can add a new candidate @local', async ({ recruitmentPage, page, loggedInPage }) => {
    const ts = Date.now();
    const firstName = `Test_${ts}`;
    const lastName = `Candidate_${ts}`;
    const email = `test_${ts}@test.com`;
    await recruitmentPage.goto();
    await recruitmentPage.clickAdd();
    expect(page.url()).toContain('/addCandidate');
    await recruitmentPage.fillCandidateForm(firstName, lastName, email);
    await recruitmentPage.clickSave();
    await recruitmentPage.goto();
    await recruitmentPage.searchCandidate(firstName);
    await expect(page.locator('.oxd-table-body')).toContainText(firstName);
  });

  test('candidates search form visible @local', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.goto();
    const fields = await recruitmentPage.getSearchFormFields();
    expect(fields.length).toBeGreaterThanOrEqual(3);
    expect(fields).toContain('Job Title');
    expect(fields).toContain('Vacancy');
  });

  test('vacancies page loads @local', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.gotoVacancies();
    expect(await recruitmentPage.getCurrentUrl()).toContain('/recruitment/viewJobVacancy');
  });

  test('vacancies table visible @local', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.gotoVacancies();
    const tableVisible = await recruitmentPage.isTableVisible();
    expect(tableVisible).toBe(true);
  });

  test('recruitment topbar tabs visible @local', async ({ recruitmentPage, loggedInPage }) => {
    await recruitmentPage.goto();
    const tabs = await recruitmentPage.getTopbarTabs();
    expect(tabs).toContain('Candidates');
    expect(tabs).toContain('Vacancies');
  });
});
