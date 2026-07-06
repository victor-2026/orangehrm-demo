import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class WorkspaceNotificationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/web/index.php/admin/workspaceNotificationConfiguration');
    await this.waitForLoad('.orangehrm-main-title', 30000);
  }

  async setEnableCheckbox(enable: boolean) {
    const enableSwitch = this.page.locator('.oxd-switch-input').first();
    const enableCheckbox = this.page.locator('.oxd-switch-wrapper').first().locator('input[type="checkbox"]');
    
    // Check current state
    const isCurrentlyChecked = await enableCheckbox.isChecked();
    
    // Only toggle if needed
    if ((enable && !isCurrentlyChecked) || (!enable && isCurrentlyChecked)) {
      const putResponse = this.page.waitForResponse(
        response => response.url().includes('/api/v2/admin/workspace-notification/config')
          && response.request().method() === 'PUT'
          && response.status() === 200,
        { timeout: 10000 }
      );
      await enableSwitch.click();
      await putResponse;
      
      // Wait a moment for UI to update
      await this.page.waitForTimeout(500);
    }
  }

  async selectPlatform(platform: 'Slack' | 'Google Chat') {
    const platformDropdown = this.page.locator('.oxd-input-group:has(label:has-text("Platform")) .oxd-select-text-input');
    await platformDropdown.click();
    await this.page.locator(`.oxd-select-option:has-text("${platform}")`).click();
  }

  async fillWebhookUrl(url: string) {
    const webhookInput = this.page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) input');
    await webhookInput.fill(url);
    // Blur to trigger validation
    await this.page.locator('.orangehrm-main-title').click();
  }

  async addRegistration(data: {
    notificationType?: string;
    platform?: 'Slack' | 'Google Chat';
    webhookUrl?: string;
    channelName?: string;
    subUnit?: string;
    timezone?: string;
    time?: string; // Format: "HH:MM"
  }): Promise<{success: boolean; validationError?: boolean}> {
    // Fill notification type if provided
    if (data.notificationType) {
      const notifTypeDropdown = this.page.locator('.oxd-input-group:has(label:has-text("Notification Type")) .oxd-select-text-input');
      await notifTypeDropdown.click();
      await this.page.locator(`.oxd-select-option:has-text("${data.notificationType}")`).click();
    }

    // Fill platform if provided
    if (data.platform) {
      await this.selectPlatform(data.platform);
    }

    // Fill webhook URL if provided
    if (data.webhookUrl) {
      await this.fillWebhookUrl(data.webhookUrl);
    }

    // Fill channel name if provided
    if (data.channelName) {
      const channelInput = this.page.locator('.oxd-input-group:has(label:has-text("Channel Name")) input');
      await channelInput.fill(data.channelName);
    }

    // Fill sub unit if provided
    if (data.subUnit) {
      const subUnitDropdown = this.page.locator('.oxd-input-group:has(label:has-text("Sub Unit")) .oxd-select-text-input');
      await subUnitDropdown.click();
      await this.page.locator(`.oxd-select-option:has-text("${data.subUnit}")`).click();
    }

    // Fill timezone if provided
    if (data.timezone) {
      const tzDropdown = this.page.locator('.oxd-input-group:has(label:has-text("Timezone")) .oxd-select-text-input');
      await tzDropdown.click();
      await this.page.locator(`.oxd-select-option:has-text("${data.timezone}")`).click();
    }

    // Fill time if provided
    if (data.time) {
      const [hours, minutes] = data.time.split(':');
      await this.page.locator('.oxd-time-input').click();
      await this.page.waitForTimeout(500);
      await this.page.locator('.oxd-time-hour-input-text').fill(hours);
      await this.page.locator('.oxd-time-minute-input-text').fill(minutes);
      await this.page.locator('.orangehrm-main-title').click();
    }

    // Click Add Registration and handle response
    // Use Promise.race to handle cases where POST might not be sent due to client-side validation
    const postResponse = this.page.waitForResponse(
      response => response.url().includes('/api/v2/admin/workspace-notification/registrations')
        && response.request().method() === 'POST',
      { timeout: 10000 }
    );
    
    await this.page.locator('button:has-text("Add Registration")').click();
    
    try {
      // Wait for either POST response or a short timeout to check for validation errors
      await Promise.race([
        postResponse,
        this.page.waitForTimeout(3000) // Wait 3 seconds to see if validation errors appear
      ]);
      
      // If we get here without error, the POST was successful (or we timed out after 3s)
      // Check if we actually got a response
      try {
        await postResponse;
        return {success: true};
      } catch {
        // postResponse timed out, check for validation errors
        const hasValidationErrors = await this.hasValidationErrors();
        if (hasValidationErrors) {
          console.log('Form submission prevented by client-side validation');
          return {success: false, validationError: true};
        }
        // No validation errors but no POST either - might be some other issue
        return {success: false};
      }
    } catch (error) {
      // Some other error occurred
      console.error('Error in addRegistration:', error);
      return {success: false};
    }
  }

  async hasValidationErrors(): Promise<boolean> {
    // Check for any validation error messages
    const errorSelectors = [
      '.oxd-input-group__message',
      '.oxd-input-field-error-message',
      'text=Required',
      'text=Should be a valid',
      'text=Already exists',
      'text=Duplicate'
    ];
    
    for (const selector of errorSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible({ timeout: 500 }).catch(() => false)) {
        return true;
      }
    }
    return false;
  }

  async getWebhookLabelText(): Promise<string> {
    const webhookLabel = this.page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) label');
    return (await webhookLabel.textContent())?.trim() ?? '';
  }

  async getWebhookPlaceholder(): Promise<string> {
    const webhookInput = this.page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) input');
    return (await webhookInput.getAttribute('placeholder')) ?? '';
  }

  async getPlatformHelpText(): Promise<string> {
    const helpText = this.page.locator('text=Create an Incoming Webhook in your').first();
    return (await helpText.textContent())?.trim() ?? '';
  }

  async getRequiredErrorCount(): Promise<number> {
    const requiredErrors = this.page.locator('.oxd-input-group__message, .oxd-input-field-error-message');
    const count = await requiredErrors.count();
    let requiredCount = 0;
    for (let i = 0; i < count; i++) {
      const text = await requiredErrors.nth(i).textContent();
      if (text?.trim() === 'Required') {
        requiredCount++;
      }
    }
    return requiredCount;
  }

  async getWebhookErrorText(): Promise<string> {
    // Try multiple possible error message patterns
    const errorSelectors = [
      'text=Should be a valid Slack Incoming Webhook URL',
      'text=Should be a valid Google Chat Webhook URL',
      '.oxd-input-group__message',
      '.oxd-input-field-error-message'
    ];
    
    for (const selector of errorSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await element.textContent();
        if (text?.trim()) {
          return text.trim();
        }
      }
    }
    return '';
  }

  async isWebhookErrorVisible(): Promise<boolean> {
    // Try multiple possible error message patterns
    const errorSelectors = [
      'text=Should be a valid Slack Incoming Webhook URL',
      'text=Should be a valid Google Chat Webhook URL',
      '.oxd-input-group__message',
      '.oxd-input-field-error-message'
    ];
    
    for (const selector of errorSelectors) {
      if (await this.page.locator(selector).isVisible({ timeout: 1000 }).catch(() => false)) {
        return true;
      }
    }
    return false;
  }

  async getSendTestButtonState(): Promise<boolean> {
    const sendTestButton = this.page.locator('button:has-text("Send Test")');
    return await sendTestButton.isEnabled();
  }
}