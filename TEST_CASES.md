# Test Cases — OrangeHRM Demo

## Legend
- 🔴 Critical — must pass for release
- 🟡 High — important for quality
- 🟢 Medium — nice to have
- ✅ (LOCAL) — passes on local Docker instance only

---

## 1. Authentication (Auth)

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| AUTH-001 | Login with valid Admin credentials → redirect to Dashboard | 🔴 | E2E | ✅ |
| AUTH-002 | Login with invalid password → error message "Invalid credentials" | 🔴 | E2E | ✅ |
| AUTH-003 | Login with empty credentials → stays on login page | 🔴 | E2E | ✅ |
| AUTH-004 | Login with non-existent user → error message | 🟡 | E2E | ❌ |
| AUTH-005 | Logout → redirect to login page | 🔴 | E2E | ❌ |
| AUTH-006 | Session expires → redirect to login | 🟡 | E2E | ❌ (not on demo) |
| AUTH-007 | Login API: POST /auth/login returns token | 🔴 | API | ⚠️ N/A (no API) |
| AUTH-008 | Login API: invalid credentials returns 401 | 🔴 | API | ⚠️ N/A (no API) |

---

## 2. Dashboard

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| DASH-001 | Dashboard loads with heading "Dashboard" | 🔴 | E2E | ✅ |
| DASH-002 | Quick Launch widgets visible | 🟡 | E2E | ✅ |
| DASH-003 | Widget count > 0 | 🟡 | E2E | ✅ |
| DASH-004 | Navigate to module from Dashboard | 🟡 | E2E | ✅ |

---

## 3. Admin — User Management

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| ADMIN-001 | Admin page loads with user list | 🔴 | E2E | ✅ |
| ADMIN-002 | Add new user → appears in list | 🔴 | E2E | ✅ (LOCAL) |
| ADMIN-003 | Search for existing user | 🔴 | E2E | ✅ |
| ADMIN-004 | Delete user → removed from list | 🟡 | E2E | ❌ |
| ADMIN-005 | Edit user role | 🟡 | E2E | ❌ |
| ADMIN-006 | Add user with duplicate username → error | 🟡 | E2E | ❌ |
| ADMIN-007 | Add user with empty required fields → validation | 🟡 | E2E | ❌ |


---

## 4. PIM — Employee Management

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| PIM-001 | PIM page loads with employee list | 🔴 | E2E | ✅ |
| PIM-002 | Add new employee → appears in list | 🔴 | E2E | ✅ (LOCAL) |
| PIM-003 | Search for existing employee | 🔴 | E2E | ✅ |
| PIM-004 | Edit employee details | 🟡 | E2E | ✅ (LOCAL) |
| PIM-005 | Delete employee | 🟡 | E2E | ✅ (LOCAL) |
| PIM-006 | Add employee with login credentials | 🟡 | E2E | ❌ |
| PIM-007 | Employee list pagination | 🟡 | E2E | ❌ |


---

## 5. Leave Management

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| LEAVE-001 | Leave list page loads | 🔴 | E2E | ✅ |
| LEAVE-002 | Apply for leave → appears in list | 🔴 | E2E | ✅ (LOCAL) |
| LEAVE-003 | Leave balance displayed | 🟡 | E2E | ✅ |
| LEAVE-004 | Reject leave request | 🟡 | E2E | ❌ |
| LEAVE-005 | Leave type filter | 🟢 | E2E | ❌ |

---

## 6. Time Management

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| TIME-001 | Timesheet page loads | 🔴 | E2E | ✅ |
| TIME-002 | View employee timesheet | 🟡 | E2E | ✅ |
| TIME-003 | Add time entry | 🟡 | E2E | ❌ |

---

## 7. Recruitment

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| RECR-001 | Candidates page loads | 🔴 | E2E | ✅ |
| RECR-002 | Add candidate → appears in list | 🟡 | E2E | ✅ |
| RECR-003 | Search candidates | 🟡 | E2E | ✅ |

---

## 8. My Info (Personal Details)

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| INFO-001 | Personal details page loads | 🔴 | E2E | ✅ |
| INFO-002 | Edit personal details → saved | 🟡 | E2E | ✅ |
| INFO-003 | Upload profile photo | 🟢 | E2E | ❌ |

---

## 9. Performance

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| PERF-001 | Performance review page loads | 🟡 | E2E | ✅ |
| PERF-002 | Search performance reviews | 🟢 | E2E | ❌ |

---

## 10. Directory

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| DIR-001 | Directory page loads | 🟡 | E2E | ✅ |
| DIR-002 | Search directory | 🟢 | E2E | ❌ |

---

## 11. Maintenance

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| MAINT-001 | Maintenance password screen visible (username disabled) | 🟡 | E2E | ✅ |
| MAINT-002 | Enter admin password → access maintenance dashboard | 🟡 | E2E | ✅ |
| MAINT-003 | Purge employee data (destructive) | 🟢 | E2E | ❌ (LOCAL) |

---

## 12. Claim

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| CLAIM-001 | Claim page loads | 🟡 | E2E | ✅ |
| CLAIM-002 | Assign claim | 🟢 | E2E | ❌ |

---

## 13. Buzz (Social)

| ID | Test Case | Priority | Type | Status |
|----|-----------|:--------:|------|:------:|
| BUZZ-001 | Buzz page loads | 🟡 | E2E | ✅ |
| BUZZ-002 | Create post | 🟡 | E2E | ✅ (LOCAL) |
| BUZZ-003 | Like post | 🟢 | E2E | ❌ |

---

## Summary

| Module | Total | ✅ Done | ❌ Todo | Coverage |
|--------|:-----:|:-------:|:-------:|:--------:|
| Auth | 8 | 3 | 5 | 38% |
| Dashboard | 4 | 4 | 0 | 100% |
| Admin | 7 | 3 | 4 | 43% |
| PIM | 7 | 5 | 2 | 71% |
| Leave | 5 | 3 | 2 | 60% |
| Time | 3 | 2 | 1 | 67% |
| Recruitment | 3 | 3 | 0 | 100% |
| My Info | 3 | 2 | 1 | 67% |
| Performance | 2 | 1 | 1 | 50% |
| Directory | 2 | 1 | 1 | 50% |
| Maintenance | 3 | 2 | 1 | 67% |
| Claim | 2 | 1 | 1 | 50% |
| Buzz | 3 | 2 | 1 | 67% |
| **TOTAL** | **52** | **34** | **18** | **65%** |
