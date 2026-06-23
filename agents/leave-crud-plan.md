# Leave CRUD Test Plan

## Module: Leave Management
**Base URL:** http://localhost:8080
**Auth:** Admin / Orangehrm@2026

## Test Scenarios

### 1. Apply Leave
- Navigate to Leave → Apply Leave
- Select Leave Type (CAN - Personal)
- Select start date and end date
- Fill comments
- Submit leave request
- Verify success toast appears

### 2. My Leave List
- Navigate to Leave → My Leave
- Verify leave list table is visible
- Verify the applied leave appears in list
- Verify status is "Pending Approval"

### 3. Approve Leave (as Admin)
- Navigate to Leave → Leave List
- Filter by status "Pending Approval"
- Click on leave request
- Click Approve button
- Verify status changes to "Approved"

### 4. Reject Leave (as Admin)
- Apply a new leave request
- Navigate to Leave → Leave List
- Filter by status "Pending Approval"
- Click on leave request
- Click Reject button
- Fill rejection reason
- Verify status changes to "Rejected"

### 5. Cancel Leave
- Apply a new leave request
- Navigate to Leave → My Leave
- Click on pending leave request
- Click Cancel button
- Verify status changes to "Cancelled"

### 6. Leave Balance
- Navigate to Leave → Leave List
- Verify leave balance section is visible
- Verify balance numbers are displayed

### 7. Date Validation
- Navigate to Leave → Apply Leave
- Try to submit without selecting dates
- Verify validation error appears
- Try to set end date before start date
- Verify validation error appears

### 8. Leave Types Dropdown
- Navigate to Leave → Apply Leave
- Click Leave Type dropdown
- Verify all leave types are available
- Select different types and verify selection works
