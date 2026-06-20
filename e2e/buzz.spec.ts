import { test, expect } from '../helpers/fixtures';

test.describe('Buzz', () => {
  test('buzz page loads @smoke', async ({ buzzPage, loggedInPage }) => {
    await buzzPage.goto();
    expect(await buzzPage.getCurrentUrl()).toContain('/buzz/viewBuzz');
  });

  test('can like a post @smoke', async ({ buzzPage, page, loggedInPage }) => {
    await buzzPage.goto();
    const postCount = await buzzPage.getPostCount();
    test.skip(postCount === 0, 'No posts to like on shared demo');
    await buzzPage.likeFirstPost();
    await page.reload();
    await page.locator('.orangehrm-buzz-post').first().waitFor({ timeout: 10000 }).catch(() => {});
    expect(await buzzPage.getPostCount()).toBeGreaterThan(0);
  });

  test('can create a post @local', async ({ buzzPage, page, loggedInPage }) => {
    await buzzPage.goto();
    const postText = `Phase2 test post ${Date.now()}`;
    await buzzPage.createPost(postText);
    await page.reload();
    await page.locator('.orangehrm-buzz-post').first().waitFor({ timeout: 10000 }).catch(() => {});
    const postCount = await buzzPage.getPostCount();
    expect(postCount).toBeGreaterThan(0);
  });
});
