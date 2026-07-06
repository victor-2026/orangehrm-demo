import { test, expect } from '../helpers/fixtures';
import { applyMutation } from '../helpers/mutations';

test.beforeEach(async ({ page }) => {
  await applyMutation(page, process.env.MUTATION_ID);
});

test.describe('Workspace Notification Configuration - KISS', () => {

  test.describe('1. Page Load & Basic Functionality', () => {

    test('1.1 Page loads with correct heading @smoke', async ({ workspaceNotificationPage, page }) => {
      await workspaceNotificationPage.goto();
      await expect(page).toHaveURL(/workspaceNotificationConfiguration/);
      await expect(page.locator('.orangehrm-main-title')).toContainText('Workspace Notification Configuration');
    });

  });

  test.describe('2. Form Interactions', () => {

    test('2.1 Platform switching between Slack and Google Chat @local', async ({ workspaceNotificationPage, page,  }) => {
      await workspaceNotificationPage.goto();

      // Test Slack platform
      await workspaceNotificationPage.selectPlatform('Slack');
      
      const slackLabel = await workspaceNotificationPage.getWebhookLabelText();
      expect(slackLabel).toContain('Slack Incoming Webhook URL');
      
      const slackPlaceholder = await workspaceNotificationPage.getWebhookPlaceholder();
      expect(slackPlaceholder).toMatch(/https:\/\/hooks\.slack\.com/);
      
      const slackHelpText = await workspaceNotificationPage.getPlatformHelpText();
      expect(slackHelpText).toContain('Create an Incoming Webhook in your Slack workspace');

      // Test Google Chat platform
      await workspaceNotificationPage.selectPlatform('Google Chat');
      
      const googleLabel = await workspaceNotificationPage.getWebhookLabelText();
      expect(googleLabel).toContain('Google Chat Webhook URL');
      
      const googlePlaceholder = await workspaceNotificationPage.getWebhookPlaceholder();
      expect(googlePlaceholder).toMatch(/https:\/\/chat\.googleapis\.com/);
      
      const googleHelpText = await workspaceNotificationPage.getPlatformHelpText();
      expect(googleHelpText).toContain('Create an Incoming Webhook in your Google Chat workspace');

      // Switch back to Slack to ensure toggle works
      await workspaceNotificationPage.selectPlatform('Slack');
      const finalLabel = await workspaceNotificationPage.getWebhookLabelText();
      expect(finalLabel).toContain('Slack Incoming Webhook URL');
    });

    test('2.2 Empty submission shows required field errors @local', async ({ workspaceNotificationPage, page,  }) => {
      await workspaceNotificationPage.goto();

      // Initially, form should have no errors
      const initialErrorCount = await workspaceNotificationPage.getRequiredErrorCount();
      expect(initialErrorCount).toBe(0);

      // Click Add Registration without filling any fields
      await page.locator('button:has-text("Add Registration")').click();

      // Wait for validation errors to appear
      await page.waitForTimeout(1000);

      // Check that we have required errors
      const requiredErrorCount = await workspaceNotificationPage.getRequiredErrorCount();
      expect(requiredErrorCount).toBeGreaterThanOrEqual(4);

      // Verify the platform dropdown shows "-- Select --" or similar
      const platformDropdown = page.locator('.oxd-input-group:has(label:has-text("Platform")) .oxd-select-text-input');
      await expect(platformDropdown).toBeVisible();
    });

    test('2.3 Webhook URL validation @local', async ({ workspaceNotificationPage, page,  }) => {
      await workspaceNotificationPage.goto();

      // Select Slack platform
      await workspaceNotificationPage.selectPlatform('Slack');

      // Test invalid URL (non-HTTPS)
      const webhookInput = page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) input');
      await webhookInput.fill('http://not-https-url.com');
      await page.locator('.orangehrm-main-title').click();
      
      // Check for error message
      await expect(page.locator('text=Should be a valid Slack Incoming Webhook URL')).toBeVisible({ timeout: 5000 });

      // Test valid Slack URL (same as existing test)
      await webhookInput.fill('https://hooks.slack.com/services/T00/B00/x123');
      await page.locator('.orangehrm-main-title').click();
      
      // Error should clear
      await expect(page.locator('text=Should be a valid Slack Incoming Webhook URL')).not.toBeVisible({ timeout: 5000 });
    });

  });

});