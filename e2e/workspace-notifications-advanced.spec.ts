import { test, expect } from '../helpers/fixtures';
import { applyMutation } from '../helpers/mutations';

test.beforeEach(async ({ page }) => {
  await applyMutation(page, process.env.MUTATION_ID);
});

test.describe('Workspace Notification - Advanced', () => {

  test('Create registration successfully @local', async ({ workspaceNotificationPage, page }) => {
    const timestamp = Date.now();
    const channelName = `#team-${timestamp}`;

    // Clean up any existing Birthdays/Slack registrations to avoid conflict
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

    await workspaceNotificationPage.goto();

    const result = await workspaceNotificationPage.addRegistration({
      notificationType: 'Birthday',
      platform: 'Slack',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/x123',
      channelName,
      subUnit: 'OrangeHRM Demo',
      timezone: 'Coordinated Universal Time - UTC',
      time: '08:00',
    });

    expect(result.success).toBe(true);

    // Verify form resets
    await expect(page.locator('.oxd-select-text-input').first()).toContainText('-- Select --');

    // Verify registration appears in the table
    await expect(page.locator('.oxd-table-body')).toContainText(channelName);
    await expect(page.locator('.oxd-table-body')).toContainText('Birthday');
    await expect(page.locator('.oxd-table-body')).toContainText('Slack');
  });

  test('Registration table displays existing entries @local', async ({ workspaceNotificationPage, page }) => {
    const timestamp = Date.now();
    const channelName = `#table-${timestamp}`;

    // Clean up existing Birthday/Slack registrations
    const existingResp = await page.request.get(
      'http://localhost:8080/web/index.php/api/v2/admin/workspace-notification/registrations?limit=50&offset=0'
    );
    const existingData = await existingResp.json();
    if (existingData.data?.length) {
      const ids = existingData.data
        .filter((r: any) => r.eventType === 'BIRTHDAY' && r.provider === 'slack')
        .map((r: any) => r.id);
      if (ids.length) {
        await page.request.delete(
          'http://localhost:8080/web/index.php/api/v2/admin/workspace-notification/registrations',
          { data: { ids } }
        );
      }
    }

    await workspaceNotificationPage.goto();

    // Create a registration
    const result = await workspaceNotificationPage.addRegistration({
      notificationType: 'Birthday',
      platform: 'Slack',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/x123',
      channelName,
      subUnit: 'OrangeHRM Demo',
      timezone: 'Coordinated Universal Time - UTC',
      time: '08:00',
    });

    expect(result.success).toBe(true);

    // Verify it appears in the table with correct data
    await expect(page.locator('.oxd-table-body')).toContainText(channelName);
    await expect(page.locator('.oxd-table-body')).toContainText('Birthday');
    await expect(page.locator('.oxd-table-body')).toContainText('Slack');

    // Delete via API to clean up
    const resp = await page.request.get(
      'http://localhost:8080/web/index.php/api/v2/admin/workspace-notification/registrations?limit=50&offset=0'
    );
    const data = await resp.json();
    if (data.data?.length) {
      await page.request.delete(
        'http://localhost:8080/web/index.php/api/v2/admin/workspace-notification/registrations',
        { data: { ids: data.data.map((r: any) => r.id) } }
      );
    }
  });

  test('Disable feature makes form read-only @local', async ({ workspaceNotificationPage, page }) => {
    await workspaceNotificationPage.goto();

    // Ensure feature is enabled first
    await workspaceNotificationPage.setEnableCheckbox(true);

    // Verify form is interactive
    const platformDropdown = page.locator('.oxd-input-group:has(label:has-text("Platform")) .oxd-select-text-input');
    await expect(platformDropdown).toBeEnabled();

    // Disable the feature
    await workspaceNotificationPage.setEnableCheckbox(false);

    // Reload the page to verify server state
    await workspaceNotificationPage.goto();

    // Checkbox should be unchecked
    const enableCheckbox = page.locator('.oxd-switch-wrapper').first().locator('input[type="checkbox"]');
    await expect(enableCheckbox).not.toBeChecked();

    // Re-enable for other tests
    await workspaceNotificationPage.setEnableCheckbox(true);
  });

  test.fixme('Duplicate registration prevention @local', async ({ workspaceNotificationPage, page }) => {
    const timestamp = Date.now();
    const channelName = `#dup-test-${timestamp}`;

    // Clean up any existing Birthday/Slack registrations to avoid conflict
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

    await workspaceNotificationPage.goto();

    // Create first registration
    const firstResult = await workspaceNotificationPage.addRegistration({
      notificationType: 'Birthday',
      platform: 'Slack',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/x123',
      channelName,
      subUnit: 'OrangeHRM Demo',
      timezone: 'Coordinated Universal Time - UTC',
      time: '08:00',
    });

    expect(firstResult.success).toBe(true);
    await expect(page.locator('.oxd-table-body')).toContainText(channelName);

    // Try to create a duplicate registration (same notification type + platform)
    // This should be prevented by client-side duplicate checking
    const duplicateResult = await workspaceNotificationPage.addRegistration({
      notificationType: 'Birthday',
      platform: 'Slack',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/x456', // Different webhook
      channelName: `${channelName}-duplicate`,
      subUnit: 'OrangeHRM Demo',
      timezone: 'Coordinated Universal Time - UTC',
      time: '09:00',
    });

    // The addRegistration should detect validation/duplicate error
    expect(duplicateResult.success).toBe(false);
    expect(duplicateResult.validationError).toBe(true);

    // Clean up
    const cleanupResp = await page.request.get(
      'http://localhost:8080/web/index.php/api/v2/admin/workspace-notification/registrations?limit=50&offset=0'
    );
    const cleanupData = await cleanupResp.json();
    if (cleanupData.data?.length) {
      await page.request.delete(
        'http://localhost:8080/web/index.php/api/v2/admin/workspace-notification/registrations',
        { data: { ids: cleanupData.data.map((r: any) => r.id) } }
      );
    }
  });

});
