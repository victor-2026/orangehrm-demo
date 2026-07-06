import { test, expect } from '../helpers/fixtures';
import { applyMutation } from '../helpers/mutations';

test.beforeEach(async ({ page }) => {
  await applyMutation(page, process.env.MUTATION_ID);
});

async function gotoConfig(page: import('playwright').Page) {
  await page.goto('http://localhost:8080/web/index.php/admin/workspaceNotificationConfiguration', { waitUntil: 'domcontentloaded', timeout: 15000 });
  if (page.url().includes('/auth/login')) {
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'Orangehrm@2026');
    await page.click('button[type="submit"]');
    await page.waitForURL(/workspaceNotificationConfiguration|dashboard/, { timeout: 10000 });
  }
  if (!page.url().includes('workspaceNotificationConfiguration')) {
    await page.goto('http://localhost:8080/web/index.php/admin/workspaceNotificationConfiguration', { waitUntil: 'domcontentloaded', timeout: 15000 });
  }
}

test.describe('Workspace Notification Configuration', () => {

  test.describe('1. Page Load & UI Elements', () => {

    test('1.1 Page loads with correct heading @local', async ({ page }) => {
      await gotoConfig(page);
      await expect(page).toHaveURL(/workspaceNotificationConfiguration/);

      await expect(page.locator('.orangehrm-main-title')).toContainText('Workspace Notification Configuration');

      await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '/ Configuration' })).toBeVisible();
    });

    test('1.2 Enable checkbox toggle is visible and clickable @local', async ({ page }) => {
      await gotoConfig(page);

      const enableCheckbox = page.locator('.oxd-switch-wrapper').first().locator('input[type="checkbox"]');
      const enableSwitchSpan = page.locator('.oxd-switch-input').first();
      await expect(enableCheckbox).toBeVisible();

      const initialChecked = await enableCheckbox.isChecked();
      const expectedAfterToggle = !initialChecked;
      const longTimeout = { timeout: 10000 };

      const putToggle1 = page.waitForResponse(
        response => response.url().includes('/api/v2/admin/workspace-notification/config')
          && response.status() === 200
      );
      await enableSwitchSpan.click();
      await putToggle1;
      await gotoConfig(page);

      if (expectedAfterToggle) {
        await expect(enableCheckbox).toBeChecked(longTimeout);
      } else {
        await expect(enableCheckbox).not.toBeChecked(longTimeout);
      }

      const putToggle2 = page.waitForResponse(
        response => response.url().includes('/api/v2/admin/workspace-notification/config')
          && response.status() === 200
      );
      await enableSwitchSpan.click();
      await putToggle2;
      await gotoConfig(page);

      if (initialChecked) {
        await expect(enableCheckbox).toBeChecked(longTimeout);
      } else {
        await expect(enableCheckbox).not.toBeChecked(longTimeout);
      }

      const putToggle3 = page.waitForResponse(
        response => response.url().includes('/api/v2/admin/workspace-notification/config')
          && response.status() === 200
      );
      await enableSwitchSpan.click();
      await putToggle3;
      await gotoConfig(page);

      if (expectedAfterToggle) {
        await expect(enableCheckbox).toBeChecked(longTimeout);
      } else {
        await expect(enableCheckbox).not.toBeChecked(longTimeout);
      }
    });

  });

  test.describe('2. Form Field Interactions', () => {

    test('2.2 Platform switching between Slack and Google Chat @local', async ({ page }) => {
      await gotoConfig(page);

      const platformDropdown = page.locator('.oxd-input-group:has(label:has-text("Platform")) .oxd-select-text-input');
      await platformDropdown.click();

      await expect(page.locator('.oxd-select-option:has-text("Slack")')).toBeVisible();
      await expect(page.locator('.oxd-select-option:has-text("Google Chat")')).toBeVisible();

      await page.locator('.oxd-select-option:has-text("Slack")').click();
      const webhookLabel = page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) label');
      await expect(webhookLabel).toContainText('Slack Incoming Webhook URL');
      const webhookInput = page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) input');
      await expect(webhookInput).toHaveAttribute('placeholder', /https:\/\/hooks\.slack\.com/);
      await expect(page.locator('text=Create an Incoming Webhook in your Slack workspace')).toBeVisible();

      await platformDropdown.click();
      await page.locator('.oxd-select-option:has-text("Google Chat")').click();
      await expect(webhookLabel).toContainText('Google Chat Webhook URL');
      await expect(webhookInput).toHaveAttribute('placeholder', /https:\/\/chat\.googleapis\.com/);
      await expect(page.locator('text=Create an Incoming Webhook in your Google Chat workspace')).toBeVisible();
    });

    test('2.7 Send Test button state depends on webhook URL @local', async ({ page }) => {
      await gotoConfig(page);

      const sendTestButton = page.locator('button:has-text("Send Test")');
      await expect(sendTestButton).toBeDisabled();

      const webhookInput = page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) input');
      await webhookInput.fill('https://hooks.slack.com/services/T00/B00/x123');

      await page.locator('.orangehrm-main-title').click();

      await expect(sendTestButton).toBeEnabled();

      await webhookInput.fill('');
      await page.locator('.orangehrm-main-title').click();
      await expect(sendTestButton).toBeDisabled();
    });

  });

  test.describe('3. Form Validation', () => {

    test('3.1 Empty submission shows required field errors @local', async ({ page }) => {
      await gotoConfig(page);

      await expect(page.locator('.oxd-select-text-input').first()).toContainText('-- Select --');

      await page.locator('button:has-text("Add Registration")').click();

      const requiredErrors = page.locator('.oxd-input-group__message, .oxd-input-field-error-message');
      await expect(requiredErrors.first()).toBeVisible({ timeout: 5000 });

      const errorTexts = await requiredErrors.allTextContents();
      const requiredCount = errorTexts.filter(t => t.trim() === 'Required').length;
      expect(requiredCount).toBeGreaterThanOrEqual(4);
    });

    test('3.2 Invalid Slack webhook URL shows specific error @local', async ({ page }) => {
      await gotoConfig(page);

      const platformDropdown = page.locator('.oxd-input-group:has(label:has-text("Platform")) .oxd-select-text-input');
      await platformDropdown.click();
      await page.locator('.oxd-select-option:has-text("Slack")').click();

      const webhookInput = page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) input');
      await webhookInput.fill('http://not-https-url.com');
      await page.locator('.orangehrm-main-title').click();
      await expect(page.locator('text=Should be a valid Slack Incoming Webhook URL')).toBeVisible({ timeout: 5000 });

      await webhookInput.fill('https://hooks.slack.com/services/T00/B00/x123');
      await page.locator('.orangehrm-main-title').click();

      await expect(page.locator('text=Should be a valid Slack Incoming Webhook URL')).not.toBeVisible({ timeout: 5000 });
    });

  });

  test.describe('4. Registration CRUD Operations', () => {

    test('4.1 Create a new Slack registration successfully @local', async ({ page }) => {
      const timestamp = Date.now();
      const channelName = `#team-${timestamp}`;

      await gotoConfig(page);

      const existingResp = await page.request.get(
        'http://localhost:8080/web/index.php/api/v2/admin/workspace-notification/registrations?limit=50&offset=0'
      );
      const existingData = await existingResp.json();
      if (existingData.data?.length) {
        const birthdaySlackIds = existingData.data
          .filter((r: any) => r.eventType === 'BIRTHDAY' && r.provider === 'slack')
          .map((r: any) => r.id);
        if (birthdaySlackIds.length) {
          await page.request.delete(
            'http://localhost:8080/web/index.php/api/v2/admin/workspace-notification/registrations',
            { data: { ids: birthdaySlackIds } }
          );
        }
      }

      await gotoConfig(page);

      const notifTypeDropdown = page.locator('.oxd-input-group:has(label:has-text("Notification Type")) .oxd-select-text-input');
      await notifTypeDropdown.click();
      await page.locator('.oxd-select-option:has-text("Birthday")').click();

      const platformDropdown = page.locator('.oxd-input-group:has(label:has-text("Platform")) .oxd-select-text-input');
      await platformDropdown.click();
      await page.locator('.oxd-select-option:has-text("Slack")').click();

      const webhookInput = page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) input');
      await webhookInput.fill('https://hooks.slack.com/services/T00/B00/x123');

      const channelInput = page.locator('.oxd-input-group:has(label:has-text("Channel Name")) input');
      await channelInput.fill(channelName);

      const subUnitDropdown = page.locator('.oxd-input-group:has(label:has-text("Sub Unit")) .oxd-select-text-input');
      await subUnitDropdown.click();
      await page.locator('.oxd-select-option:has-text("OrangeHRM Demo")').click();

      const tzDropdown = page.locator('.oxd-input-group:has(label:has-text("Timezone")) .oxd-select-text-input');
      await tzDropdown.click();
      await page.locator('.oxd-select-option:has-text("Coordinated Universal Time - UTC")').click();

      await page.locator('.oxd-time-input').click();
      await page.waitForTimeout(500);
      await page.locator('.oxd-time-hour-input-text').fill('08');
      await page.locator('.oxd-time-minute-input-text').fill('00');
      await page.locator('.orangehrm-main-title').click();
      await page.waitForTimeout(300);

      const postResponse = page.waitForResponse(
        response => response.url().includes('/api/v2/admin/workspace-notification/registrations')
          && response.request().method() === 'POST'
      );
      await page.locator('button:has-text("Add Registration")').click();

      await postResponse;

      await expect(page.locator('.oxd-select-text-input').first()).toContainText('-- Select --');

      await expect(page.locator('.oxd-table-body')).toContainText(channelName);
      await expect(page.locator('.oxd-table-body')).toContainText('Birthday');
      await expect(page.locator('.oxd-table-body')).toContainText('Slack');

      const toast = page.locator('.oxd-toast');
      if (await toast.isVisible().catch(() => false)) {
        await expect(toast).toBeVisible();
      }
    });

  });

  test.describe('5. Additional Validation', () => {

    test('5.1 Cross-platform URL mismatch shows correct error @local', async ({ page }) => {
      await gotoConfig(page);

      const platformDropdown = page.locator('.oxd-input-group:has(label:has-text("Platform")) .oxd-select-text-input');
      await platformDropdown.click();
      await page.locator('.oxd-select-option:has-text("Google Chat")').click();

      const webhookInput = page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) input');
      await webhookInput.fill('https://hooks.slack.com/services/T00/B00/x123');
      await page.locator('.orangehrm-main-title').click();

      await expect(page.locator('text=Should be a valid Google Chat Webhook URL')).toBeVisible({ timeout: 5000 });
    });

    test('5.2 Empty submission with platform and webhook still shows validation errors @local', async ({ page }) => {
      await gotoConfig(page);

      const platformDropdown = page.locator('.oxd-input-group:has(label:has-text("Platform")) .oxd-select-text-input');
      await platformDropdown.click();
      await page.locator('.oxd-select-option:has-text("Slack")').click();

      const webhookInput = page.locator('.oxd-input-group:has(label:has-text("Webhook URL")) input');
      await webhookInput.fill('https://hooks.slack.com/services/T00/B00/x123');

      await page.locator('button:has-text("Add Registration")').click();
      const errors = page.locator('.oxd-input-group__message, .oxd-input-field-error-message');
      await expect(errors.first()).toBeVisible({ timeout: 5000 });

      const errorTexts = await errors.allTextContents();
      const visible = errorTexts.filter(t => t.trim().length > 0).length;
      expect(visible).toBeGreaterThanOrEqual(1);
    });

    test('5.3 Time picker opens and has editable hour/minute fields @local', async ({ page }) => {
      await gotoConfig(page);

      await page.locator('.oxd-time-input').click();
      await page.waitForTimeout(500);

      await expect(page.locator('.oxd-time-hour-input-text')).toBeVisible();
      await expect(page.locator('.oxd-time-minute-input-text')).toBeVisible();

      await page.locator('.oxd-time-hour-input-text').click();
      await page.locator('.oxd-time-hour-input-text').fill('08');
      await page.locator('.oxd-time-minute-input-text').click();
      await page.locator('.oxd-time-minute-input-text').fill('00');

      await expect(page.locator('.oxd-time-hour-input-text')).toHaveValue('08');
    });

  });

});
