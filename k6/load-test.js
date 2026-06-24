import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const USERNAME = __ENV.OHRM_USER || 'Admin';
const PASSWORD = __ENV.OHRM_PASS || 'Orangehrm@2026';
const API_BASE = `${BASE_URL}/web/index.php/api/v2`;
const UI_BASE = `${BASE_URL}/web/index.php`;

const errorRate = new Rate('errors');
const pageLoad = new Trend('page_load_ms');
const writeOps = new Counter('write_operations');

export const options = {
  scenarios: {
    smoke: {
      exec: 'mainFlow',
      executor: 'constant-vus',
      vus: 2,
      duration: '30s',
      tags: { scenario: 'smoke' },
    },
    load: {
      exec: 'mainFlow',
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 25 },
        { duration: '1m', target: 25 },
        { duration: '1m', target: 10 },
      ],
      tags: { scenario: 'load' },
      gracefulStop: '30s',
    },
    writes: {
      exec: 'writeFlow',
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
      tags: { scenario: 'writes' },
    },
  },
  thresholds: {
    errors: ['rate<0.15'],
    http_req_duration: ['p(95)<5000'],
    write_operations: ['count>50'],
  },
};

function api(path) {
  return `${API_BASE}${path}`;
}

function ui(path) {
  return `${UI_BASE}/${path}`;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

function getJSON(res) {
  try {
    return JSON.parse(res.body);
  } catch {
    return null;
  }
}

function login() {
  const loginPageRes = http.get(ui('auth/login'), {
    tags: { name: 'login-page' },
  });

  const tokenMatch = loginPageRes.body.match(
    /:token="&quot;([^&]+)&quot;"/
  );
  const csrfToken = tokenMatch ? tokenMatch[1] : null;

  if (!csrfToken) return null;

  const loginRes = http.post(
    ui('auth/validate'),
    {
      _token: csrfToken,
      username: USERNAME,
      password: PASSWORD,
    },
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      tags: { name: 'login' },
      redirects: 0,
    }
  );

  if (loginRes.status !== 302) return null;

  const cookies = loginRes.headers['Set-Cookie'];
  if (!cookies) return null;

  const sidMatch = cookies.match(/_orangehrm=([^;]+)/);
  return sidMatch ? `_orangehrm=${sidMatch[1]}` : null;
}

function getCsrfToken(cookie) {
  const res = http.get(ui('dashboard/index'), {
    headers: { Cookie: cookie },
    tags: { name: 'dashboard-csrf' },
  });

  const tokenMatch = res.body.match(/:token="&quot;([^&]+)&quot;"/);
  return tokenMatch ? tokenMatch[1] : null;
}

export function mainFlow() {
  group('Login', function () {
    const loginPageRes = http.get(ui('auth/login'), {
      tags: { name: 'login-page' },
    });

    check(loginPageRes, {
      'login page loaded': (r) => r.status === 200,
    });

    const tokenMatch = loginPageRes.body.match(
      /:token="&quot;([^&]+)&quot;"/
    );
    const csrfToken = tokenMatch ? tokenMatch[1] : null;

    if (!csrfToken) {
      errorRate.add(1);
      return;
    }

    const loginRes = http.post(
      ui('auth/validate'),
      {
        _token: csrfToken,
        username: USERNAME,
        password: PASSWORD,
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        tags: { name: 'login' },
        redirects: 0,
      }
    );

    const loginOk = check(loginRes, {
      'login redirects (302)': (r) => r.status === 302,
    });

    pageLoad.add(loginRes.timings.duration, { page: 'login' });

    if (!loginOk) {
      errorRate.add(1);
    }
  });

  sleep(1);

  group('Dashboard', function () {
    const res = http.get(ui('dashboard/index'), {
      tags: { name: 'dashboard' },
    });

    check(res, {
      'dashboard status 200': (r) => r.status === 200,
    });

    pageLoad.add(res.timings.duration, { page: 'dashboard' });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(2);

  group('PIM Page', function () {
    const res = http.get(ui('pim/viewEmployeeList'), {
      tags: { name: 'pim' },
    });

    check(res, {
      'pim page status 200': (r) => r.status === 200,
    });

    pageLoad.add(res.timings.duration, { page: 'pim' });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(2);

  group('Leave Page', function () {
    const res = http.get(ui('leave/viewLeaveList'), {
      tags: { name: 'leave' },
    });

    check(res, {
      'leave page status 200': (r) => r.status === 200,
    });

    pageLoad.add(res.timings.duration, { page: 'leave' });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(2);

  group('Admin Page', function () {
    const res = http.get(ui('admin/viewSystemUsers'), {
      tags: { name: 'admin' },
    });

    check(res, {
      'admin page status 200': (r) => r.status === 200,
    });

    pageLoad.add(res.timings.duration, { page: 'admin' });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });
}

export function writeFlow() {
  const cookie = login();
  if (!cookie) {
    errorRate.add(1);
    return;
  }

  const authHeaders = {
    ...JSON_HEADERS,
    Cookie: cookie,
  };

  // ─── Create User ──────────────────────────────────────────────
  group('Create User (POST)', function () {
    const csrfToken = getCsrfToken(cookie);
    if (!csrfToken) {
      errorRate.add(1);
      return;
    }

    const timestamp = Date.now();
    const username = `loadtest_${timestamp}`;

    const payload = JSON.stringify({
      username: username,
      password: 'TestPass123!',
      status: 'Enabled',
      empName: 'Jacqueline White',
      userRole: { id: 2 },
      jobTitle: { id: 9 },
    });

    const res = http.post(api('/admin/users'), payload, {
      headers: {
        ...authHeaders,
        'X-CSRF-TOKEN': csrfToken,
      },
      tags: { name: 'api-create-user' },
    });

    const data = getJSON(res);

    check(res, {
      'POST /admin/users status 200': (r) => r.status === 200,
      'POST /admin/users has id': () =>
        data && data.data && data.data.id,
    });

    writeOps.add(1);
    errorRate.add(res.status !== 200 ? 1 : 0);

    if (data && data.data && data.data.id) {
      http.del(api(`/admin/users/${data.data.id}`), null, {
        headers: authHeaders,
        tags: { name: 'api-delete-user' },
      });
    }
  });

  sleep(1);

  // ─── Add Employee (PIM) ───────────────────────────────────────
  group('Add Employee (POST)', function () {
    const timestamp = Date.now();
    const lastName = `Emp${timestamp}`;

    const payload = JSON.stringify({
      firstName: 'LoadTest',
      lastName: lastName,
    });

    const res = http.post(api('/pim/employees'), payload, {
      headers: authHeaders,
      tags: { name: 'api-add-employee' },
    });

    const data = getJSON(res);

    check(res, {
      'POST /pim/employees status 200': (r) => r.status === 200,
      'POST /pim/employees has empNumber': () =>
        data && data.data && data.data.empNumber,
    });

    writeOps.add(1);
    errorRate.add(res.status !== 200 ? 1 : 0);

    if (data && data.data && data.data.empNumber) {
      http.del(api(`/pim/employees/${data.data.empNumber}`), null, {
        headers: authHeaders,
        tags: { name: 'api-delete-employee' },
      });
    }
  });

  sleep(1);

  // ─── Apply Leave ──────────────────────────────────────────────
  group('Apply Leave (POST)', function () {
    const leaveTypesRes = http.get(api('/leave/leave-types'), {
      headers: authHeaders,
      tags: { name: 'api-leave-types' },
    });

    const leaveTypesData = getJSON(leaveTypesRes);
    if (
      !leaveTypesData ||
      !Array.isArray(leaveTypesData.data) ||
      leaveTypesData.data.length === 0
    ) {
      errorRate.add(1);
      return;
    }

    const leaveTypeId = leaveTypesData.data[0].id;
    const today = new Date();
    const fromDate = today.toISOString().split('T')[0];

    const payload = JSON.stringify({
      leaveTypeId: leaveTypeId,
      fromDate: fromDate,
      toDate: fromDate,
      comment: 'Load test leave request',
    });

    const res = http.post(api('/leave/leave-requests'), payload, {
      headers: authHeaders,
      tags: { name: 'api-apply-leave' },
    });

    check(res, {
      'POST /leave/leave-requests status': (r) =>
        r.status === 200 || r.status === 201,
    });

    writeOps.add(1);
    errorRate.add(res.status >= 400 ? 1 : 0);
  });

  sleep(1);

  // ─── Create Buzz Post ─────────────────────────────────────────
  group('Create Buzz Post (POST)', function () {
    const payload = JSON.stringify({
      type: 'text',
      text: `Load test post ${Date.now()}`,
    });

    const res = http.post(api('/buzz/posts'), payload, {
      headers: authHeaders,
      tags: { name: 'api-create-post' },
    });

    check(res, {
      'POST /buzz/posts status': (r) =>
        r.status === 200 || r.status === 201,
    });

    writeOps.add(1);
    errorRate.add(res.status >= 400 ? 1 : 0);
  });

  sleep(1);

  // ─── Create Candidate (Recruitment) ───────────────────────────
  group('Create Candidate (POST)', function () {
    const timestamp = Date.now();

    const payload = JSON.stringify({
      firstName: 'Load',
      lastName: `Candidate${timestamp}`,
      email: `load${timestamp}@test.com`,
      contactNumber: '1234567890',
    });

    const res = http.post(api('/recruitment/candidates'), payload, {
      headers: authHeaders,
      tags: { name: 'api-create-candidate' },
    });

    check(res, {
      'POST /recruitment/candidates status': (r) =>
        r.status === 200 || r.status === 201,
    });

    writeOps.add(1);
    errorRate.add(res.status >= 400 ? 1 : 0);
  });

  sleep(2);
}
