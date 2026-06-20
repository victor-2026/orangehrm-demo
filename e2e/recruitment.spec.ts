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

  test('can add a new candidate', async ({ recruitmentPage, page, loggedInPage }) => {
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
});
