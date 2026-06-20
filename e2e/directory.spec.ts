import { test, expect } from '../helpers/fixtures';

test.describe('Directory', () => {
  test('directory page loads @smoke', async ({ directoryPage, loggedInPage }) => {
    await directoryPage.goto();
    expect(await directoryPage.getCurrentUrl()).toContain('/directory');
  });
});
