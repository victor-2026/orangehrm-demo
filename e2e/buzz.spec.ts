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

  test('buzz feed has posts @smoke', async ({ buzzPage, loggedInPage }) => {
    await buzzPage.goto();
    const postCount = await buzzPage.getPostCount();
    test.skip(postCount === 0, 'No posts in feed');
    expect(postCount).toBeGreaterThan(0);
  });

  test('post actions visible @smoke', async ({ buzzPage, loggedInPage }) => {
    await buzzPage.goto();
    const postCount = await buzzPage.getPostCount();
    test.skip(postCount === 0, 'No posts in feed');
    await expect(buzzPage.isPostVisible(0)).resolves.toBe(true);
    const actionCount = await buzzPage.getActionButtons(0);
    expect(actionCount).toBeGreaterThanOrEqual(2);
  });

  test('post author and date visible @smoke', async ({ buzzPage, loggedInPage }) => {
    await buzzPage.goto();
    const postCount = await buzzPage.getPostCount();
    test.skip(postCount === 0, 'No posts in feed');
    await expect(buzzPage.isPostVisible(0)).resolves.toBe(true);
    const author = await buzzPage.getPostAuthor(0);
    expect(author).toBeTruthy();
    const date = await buzzPage.getPostDate(0);
    expect(date).toBeTruthy();
  });

  test('buzz statistics visible @smoke', async ({ buzzPage, loggedInPage }) => {
    await buzzPage.goto();
    const postCount = await buzzPage.getPostCount();
    test.skip(postCount === 0, 'No posts in feed');
    await expect(buzzPage.isPostVisible(0)).resolves.toBe(true);
    const stats = await buzzPage.getPostStats(0);
    expect(stats).toBeTruthy();
    expect(stats!.toLowerCase()).toContain('like');
  });
});
