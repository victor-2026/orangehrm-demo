# Workspace Notification Configuration Test Plan

## Application Overview

Comprehensive test plan for the OrangeHRM 5.9 Workspace Notification Configuration page at /web/index.php/admin/workspaceNotificationConfiguration. This feature allows admins to configure Slack and Google Chat webhooks for automated workspace notifications. The page contains a registration form with dynamic fields (platform-dependent labels/placeholders/validation), an Enable/Disable toggle, a Send Test button, and a data table listing existing registrations.

**Key pages and modules:**
- Admin → Configuration → Workspace Notification Configuration
- API base: /api/v2/admin/workspace-notification/

## Test Scenarios

### 1. Page Load & UI Elements

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Page loads with correct heading

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Navigate to /web/index.php/admin/workspaceNotificationConfiguration
    - expect: Page URL ends with /workspaceNotificationConfiguration
  2. Check the page heading
    - expect: Page should display 'Workspace Notification Configuration' heading (h6)
  3. Verify the breadcrumb shows 'Admin / Configuration'
    - expect: Breadcrumb heading shows 'Admin / Configuration'

#### 1.2. Enable checkbox toggle is visible and clickable

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Locate the 'Enable' checkbox beside the heading
    - expect: Checkbox labeled 'Enable' is rendered and clickable
  2. Click the Enable checkbox to toggle it off, then on again
    - expect: Checkbox toggles state each click
  3. Monitor the PUT /api/v2/admin/workspace-notification/config API call
    - expect: API returns 200 OK on each toggle

#### 1.3. Form section labels and descriptions are visible

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Scroll through the registration form section
    - expect: Label 'Notification Registration' is displayed
    - expect: Descriptive paragraph about configuring workspace channels is displayed
    - expect: All 7 form fields have visible labels
    - expect: Required fields (*) are marked with asterisk
    - expect: Help text is displayed beneath each form field

#### 1.4. Notification Registrations table is visible with correct columns

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Scroll down to the table section
    - expect: Section heading 'Notification Registrations' is visible
    - expect: Table shows columns: Notification Type, Platform, Channel, Sub Unit, Timezone, Send Time, Status, Actions
    - expect: Select-all checkbox is present in header row
    - expect: Sort controls are present on Channel and Send Time columns

#### 1.5. Empty state shows 'No Records Found'

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Check the table body when no registrations exist
    - expect: 'No Records Found' message is displayed in the table area
    - expect: Table rows are empty (no data rows rendered)

### 2. Form Field Interactions

**Seed:** `e2e/seed.spec.ts`

#### 2.1. Notification Type dropdown shows all options

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Click the Notification Type dropdown
    - expect: Dropdown opens with options: 'Birthday', 'Employees on Leave Today'
    - expect: Default selection is '-- Select --'
  2. Select 'Birthday'
    - expect: Dropdown displays 'Birthday' as selected value
  3. Select 'Employees on Leave Today'
    - expect: Dropdown displays 'Employees on Leave Today' as selected value

#### 2.2. Platform dropdown switches between Slack and Google Chat

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Click the Platform dropdown
    - expect: Dropdown opens with options: 'Slack', 'Google Chat'
  2. Select 'Slack'
    - expect: Webhook URL label changes to 'Slack Incoming Webhook URL*'
    - expect: Placeholder text shows 'https://hooks.slack.com/services/.../.../...'
    - expect: Help text mentions 'Create an Incoming Webhook in your Slack workspace'
  3. Select 'Google Chat'
    - expect: Webhook URL label changes to 'Google Chat Webhook URL*'
    - expect: Placeholder text shows 'https://chat.googleapis.com/v1/spaces/.../messages?key=...&token=...'
    - expect: Help text mentions 'Create an Incoming Webhook in your Google Chat workspace'

#### 2.3. Channel Name accepts text input

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Type '#hr-team' into Channel Name field
    - expect: Text '#hr-team' appears in the input
    - expect: Field accepts special characters (#, -)
  2. Type a long channel name (e.g. 100+ chars)
    - expect: Field does not truncate input (or has maxlength boundary)
  3. Clear the field and leave it empty
    - expect: Field is optional; no validation error when empty

#### 2.4. Sub Unit dropdown shows organization structure

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Click the Sub Unit dropdown
    - expect: Options include '-- Select --' and 'OrangeHRM Demo' (root unit)
  2. Select 'OrangeHRM Demo'
    - expect: Dropdown displays 'OrangeHRM Demo'
  3. Reset to '-- Select --'
    - expect: Dropdown shows '-- Select --' (meaning all employees)

#### 2.5. Timezone dropdown has extensive list

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Click the Timezone dropdown
    - expect: Dropdown opens with many timezone options (419 total)
    - expect: Each option follows format: '(GMT±HH:MM) Timezone Name - City'
  2. Type 'UTC' in the Search input (if searchable)
    - expect: Options filter to UTC-related entries
  3. Select a timezone (e.g. 'Coordinated Universal Time - UTC')
    - expect: Dropdown shows selected timezone

#### 2.6. Send Time time picker accepts valid time formats

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Click the Send Time input
    - expect: Placeholder shows 'HH:mm'
  2. Type '08:00'
    - expect: Input shows '08:00'
  3. Type '23:59'
    - expect: Input shows '23:59'
  4. Click the clock icon beside the input
    - expect: Time picker popup opens (if implemented) or keyboard entry remains available

#### 2.7. Send Test button state depends on webhook URL

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Check Send Test button when webhook URL is empty
    - expect: Button is disabled
  2. Enter an invalid/non-HTTPS URL and trigger validation
    - expect: Button remains disabled
    - expect: Platform-specific validation error appears
  3. Enter a valid-looking webhook URL
    - expect: Button becomes enabled (active)

### 3. Form Validation

**Seed:** `e2e/seed.spec.ts`

#### 3.1. Empty submission shows required field errors

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Ensure all fields are at default values
    - expect: All dropdowns show '-- Select --', text inputs are empty
  2. Click '+ Add Registration'
    - expect: Validation errors appear on 4 required fields: Notification Type, Webhook URL, Timezone, Send Time
    - expect: Error text is 'Required' for each
    - expect: Form is not submitted (no POST API call)

#### 3.2. Invalid Slack webhook URL shows specific error

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Select Platform = Slack
    - expect: Form shows Slack-specific fields
  2. Type 'http://not-https-url.com' (non-HTTPS)
    - expect: Error message: 'Should be a valid Slack Incoming Webhook URL (https://hooks.slack.com/services/...)'
  3. Type 'not-a-url' (no protocol)
    - expect: Same format validation error shown
  4. Type a valid Slack URL 'https://hooks.slack.com/services/T00/B00/x123'
    - expect: Validation error disappears

#### 3.3. Invalid Google Chat webhook URL shows specific error

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Select Platform = Google Chat
    - expect: Form shows Google Chat-specific fields
  2. Type 'http://not-https-url.com' (non-HTTPS)
    - expect: Error message: 'Should be a valid Google Chat webhook URL (https://chat.googleapis.com/v1/spaces/...?key=...&token=...)'
  3. Type a valid Google Chat URL 'https://chat.googleapis.com/v1/spaces/abc/messages?key=x&token=y'
    - expect: Validation error disappears

#### 3.4. Platform switch re-validates webhook URL

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Select Platform = Slack, fill a Slack-format URL
    - expect: URL is valid for Slack
  2. Switch Platform to Google Chat
    - expect: Slack URL now fails validation for Google Chat format
    - expect: Error message changes to Google Chat-specific validation
  3. Switch back to Slack
    - expect: Slack URL passes validation again

#### 3.5. Send Time invalid format validation

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Type '25:00' (invalid hour) in Send Time
    - expect: Validation error: 'Should be a valid time in HH:mm format'
  2. Type '08:60' (invalid minute)
    - expect: Validation error: 'Should be a valid time in HH:mm format'
  3. Type 'not-a-time' (non-numeric)
    - expect: Validation error: 'Should be a valid time in HH:mm format'
  4. Clear and type '08:00'
    - expect: Validation passes

#### 3.6. Multiple validation errors clear when fields are corrected

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Submit empty form to trigger all 4 required errors
    - expect: 4 'Required' errors are visible
  2. Fill each required field correctly one by one
    - expect: Each field's error disappears immediately after valid input
  3. Submit the form with all valid fields
    - expect: No validation errors, form submits successfully

### 4. Registration CRUD Operations

**Seed:** `e2e/seed.spec.ts`

#### 4.1. Create a new Slack registration successfully

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Select Notification Type = 'Birthday'
    - expect: Dropdown shows 'Birthday'
  2. Select Platform = 'Slack'
    - expect: Slack webhook field appears
  3. Enter valid Slack webhook URL
    - expect: URL accepted, Send Test becomes enabled
  4. Enter Channel Name = '#hr-team'
    - expect: Text accepted
  5. Select Sub Unit = 'OrangeHRM Demo'
    - expect: Dropdown shows selection
  6. Select Timezone = '(GMT-00:00) Coordinated Universal Time - UTC'
    - expect: Timezone selected
  7. Enter Send Time = '08:00'
    - expect: Time accepted
  8. Click '+ Add Registration'
    - expect: POST /api/v2/admin/workspace-notification/registrations returns 200/201
    - expect: Success toast message appears (if implemented)
    - expect: Form resets to defaults for new entry
    - expect: New registration appears in the table below

#### 4.2. Create a new Google Chat registration

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Select Platform = 'Google Chat'
    - expect: Google Chat webhook field appears
  2. Fill all required fields with Google Chat-specific data
    - expect: All fields accept valid input
  3. Click '+ Add Registration'
    - expect: POST request succeeds
    - expect: Registration appears in table with Platform = 'Google Chat'

#### 4.3. Create registration with all optional fields empty

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Fill only required fields: Notification Type, Platform, Webhook URL, Timezone, Send Time
    - expect: No validation errors
  2. Leave Channel Name and Sub Unit as default
    - expect: Optional fields are not validated
  3. Click '+ Add Registration'
    - expect: Registration created successfully
    - expect: Channel shows empty/null in table
    - expect: Sub Unit shows 'All' or empty in table

#### 4.4. Create duplicate registration (same type + platform)

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Create one Birthday/Slack registration successfully
    - expect: First registration created
  2. Create another Birthday/Slack registration with the same data
    - expect: Either duplicate is allowed (POST succeeds) or duplicate error is shown (4xx)

#### 4.5. View registration details in table

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. After creating at least one registration, observe the table
    - expect: Row shows: Notification Type, Platform, Channel, Sub Unit, Timezone, Send Time, Status, Action buttons (edit/delete)
  2. Click on a registration row or use pagination
    - expect: Table handles pagination if >50 records (GET limit=50)

#### 4.6. Delete a registration from the table

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Locate a registration row with the delete/trash icon
    - expect: Delete button (trash icon) is visible
  2. Click the delete button
    - expect: Confirmation dialog appears (if implemented) OR record is deleted immediately
  3. Confirm deletion
    - expect: DELETE /api/v2/admin/workspace-notification/registrations/{id} returns 200
    - expect: Row is removed from table
    - expect: 'No Records Found' shows if table is now empty

#### 4.7. Delete multiple registrations via select-all

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Select the checkbox in the table header (select all)
    - expect: All rows are checked
  2. Click the bulk delete action button
    - expect: Bulk delete API call succeeds
    - expect: All selected rows are removed

### 5. Send Test Functionality

**Seed:** `e2e/seed.spec.ts`

#### 5.1. Send Test button enabled only with valid webhook URL

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Verify initial state of Send Test button with empty URL
    - expect: Button is disabled
  2. Enter an invalid URL and trigger validation
    - expect: Button remains disabled
  3. Enter a valid format webhook URL
    - expect: Button becomes enabled
  4. Clear the webhook URL
    - expect: Button becomes disabled again

#### 5.2. Send Test attempts to POST test notification

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Enter valid webhook URL for Slack
    - expect: URL accepted
  2. Click 'Send Test'
    - expect: POST /api/v2/admin/workspace-notification/registrations/test is called
    - expect: Response is 200 (success) or 400 (bad request with validation info)
  3. Switch to Google Chat with a valid URL and click Send Test
    - expect: Same API endpoint called with platform=Google Chat data

### 6. Edge Cases & Negative Scenarios

**Seed:** `e2e/seed.spec.ts`

#### 6.1. Rapid form submission (double-click)

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Fill all required fields with valid data
    - expect: Form is ready for submission
  2. Double-click '+ Add Registration' rapidly
    - expect: Only one POST request is sent (no duplicate registrations)

#### 6.2. Extremely long webhook URL

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Type a 2000+ character HTTPS URL in the webhook field
    - expect: Field accepts or truncates gracefully
    - expect: If submitted, API handles long URL (200/400/413)

#### 6.3. Special characters in Channel Name

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Type '<script>alert(1)</script>' in Channel Name
    - expect: Input is accepted but should be escaped (no XSS)
    - expect: If saved, value displays as plain text, not executed
  2. Type unicode characters (Japanese, Cyrillic)
    - expect: Field accepts unicode text

#### 6.4. Switching platforms clears webhook URL

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Enter a Slack URL, then switch Platform to Google Chat
    - expect: The URL field retains its value but may show validation error (format mismatch) OR field may be cleared

#### 6.5. Form state persistence after page reload

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Fill the form partially (not all required fields)
    - expect: Form data is filled
  2. Reload the page
    - expect: All form fields reset to defaults ('-- Select --', empty inputs)

#### 6.6. API error handling - server returns 500

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Submit registration while server is unavailable or returns error
    - expect: Error message is displayed to the user
    - expect: Form data is preserved (not lost)

#### 6.7. Create maximum allowed registrations

**File:** `e2e/workspace-notifications.spec.ts`

**Steps:**
  1. Create registrations until reaching system limit
    - expect: API returns appropriate error message when limit exceeded
    - expect: User is informed of the limit
