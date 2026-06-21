import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class BuzzPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/buzz/viewBuzz');
    await this.page.locator('.orangehrm-buzz-post').first().waitFor({ timeout: 10000 }).catch(() => {});
  }

  async createPost(text: string) {
    await this.page.fill('.oxd-buzz-post-input', text);
    await this.page.click('button:has-text("Post")');
  }

  async getPostCount() {
    return this.page.locator('.orangehrm-buzz-post').count();
  }

  async likeFirstPost() {
    const likeBtn = this.page.locator('.orangehrm-buzz-post-actions button').first();
    await likeBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async getFirstPostLikeCount() {
    const text = await this.page.locator('.orangehrm-buzz-post-actions .orangehrm-buzz-stats').first().textContent();
    return text ? parseInt(text.match(/\d+/)?.[0] || '0') : 0;
  }

  async isPostVisible(index: number) {
    return this.page.locator('.orangehrm-buzz-post').nth(index).isVisible();
  }

  async getPostAuthor(index: number) {
    return this.page.locator('.orangehrm-buzz-post').nth(index).locator('.orangehrm-buzz-post-emp-name').textContent();
  }

  async getPostDate(index: number) {
    return this.page.locator('.orangehrm-buzz-post').nth(index).locator('.orangehrm-buzz-post-time').textContent();
  }

  async getActionButtons(index: number) {
    const footer = this.page.locator('.orangehrm-buzz-post-footer').nth(index);
    return footer.locator('.orangehrm-buzz-post-actions button').count();
  }

  async getPostStats(index: number) {
    const footer = this.page.locator('.orangehrm-buzz-post-footer').nth(index);
    return footer.locator('.orangehrm-buzz-stats').textContent();
  }

  async isCommentSectionVisible(index: number) {
    const container = this.page.locator('.oxd-sheet.orangehrm-buzz');
    const postBody = container.locator('.orangehrm-buzz-post-body').nth(index);
    const hasCommentSection = postBody.locator('[class*=comment], [class*=Comment]');
    return hasCommentSection.count() > 0;
  }
}
