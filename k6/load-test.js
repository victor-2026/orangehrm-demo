import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const USERNAME = __ENV.OHRM_USER || 'Admin';
const PASSWORD = __ENV.OHRM_PASS || 'admin123';
const API_BASE = `${BASE_URL}/web/index.php/api/v2`;
const UI_BASE = `${BASE_URL}/web/index.php`;

const errorRate = new Rate('errors');
const pageLoad = new Trend('page_load_ms');

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
  },
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
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

export function mainFlow() {
  // ─── Login ───────────────────────────────────────────────────────
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

    check(csrfToken, {
      'CSRF token extracted': (t) => t !== null,
    });

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
      return;
    }
  });

  sleep(1);

  // ─── Page Loads ──────────────────────────────────────────────────
  group('Dashboard', function () {
    const res = http.get(ui('dashboard/index'), {
      tags: { name: 'dashboard' },
    });

    check(res, {
      'dashboard status 200': (r) => r.status === 200,
      'dashboard has content': (r) =>
        r.body.includes('oxd-grid') || r.body.includes('dashboard'),
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
      'pim page has content': (r) =>
        r.body.includes('oxd-table') || r.body.includes('orangehrm'),
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

  sleep(1);

  // ─── Admin API ───────────────────────────────────────────────────
  group('Admin API', function () {
    const usersRes = http.get(api('/admin/users'), {
      headers: JSON_HEADERS,
      tags: { name: 'api-admin-users' },
    });

    const usersData = getJSON(usersRes);

    check(usersRes, {
      'GET /admin/users status 200': (r) => r.status === 200,
      'GET /admin/users has data': () =>
        usersData && Array.isArray(usersData.data),
      'GET /admin/users Admin exists': () =>
        usersData &&
        Array.isArray(usersData.data) &&
        usersData.data.some((u) => u.userName === 'Admin'),
    });

    pageLoad.add(usersRes.timings.duration, { page: 'api-admin-users' });
    errorRate.add(usersRes.status !== 200 ? 1 : 0);

    sleep(1);

    const titlesRes = http.get(api('/admin/job-titles'), {
      headers: JSON_HEADERS,
      tags: { name: 'api-admin-job-titles' },
    });

    check(titlesRes, {
      'GET /admin/job-titles status 200': (r) => r.status === 200,
    });

    pageLoad.add(titlesRes.timings.duration, { page: 'api-admin-job-titles' });
    errorRate.add(titlesRes.status !== 200 ? 1 : 0);

    sleep(1);

    const subunitsRes = http.get(api('/admin/subunits'), {
      headers: JSON_HEADERS,
      tags: { name: 'api-admin-subunits' },
    });

    check(subunitsRes, {
      'GET /admin/subunits status 200': (r) => r.status === 200,
      'GET /admin/subunits org structure': () => {
        const d = getJSON(subunitsRes);
        return d && Array.isArray(d.data);
      },
    });

    pageLoad.add(subunitsRes.timings.duration, { page: 'api-admin-subunits' });
    errorRate.add(subunitsRes.status !== 200 ? 1 : 0);
  });

  sleep(1);

  // ─── PIM API ─────────────────────────────────────────────────────
  group('PIM API', function () {
    const employeesRes = http.get(api('/pim/employees?limit=1'), {
      headers: JSON_HEADERS,
      tags: { name: 'api-pim-employees' },
    });

    const employeesData = getJSON(employeesRes);
    const firstEmpNumber =
      employeesData &&
      Array.isArray(employeesData.data) &&
      employeesData.data.length > 0
        ? employeesData.data[0].empNumber
        : null;

    check(employeesRes, {
      'GET /pim/employees status 200': (r) => r.status === 200,
      'GET /pim/employees has data': () =>
        employeesData && Array.isArray(employeesData.data),
      'GET /pim/employees has total': () =>
        employeesData &&
        employeesData.meta &&
        typeof employeesData.meta.total === 'number',
    });

    pageLoad.add(employeesRes.timings.duration, {
      page: 'api-pim-employees',
    });
    errorRate.add(employeesRes.status !== 200 ? 1 : 0);

    sleep(1);

    const countRes = http.get(api('/pim/employees/count'), {
      headers: JSON_HEADERS,
      tags: { name: 'api-pim-count' },
    });

    check(countRes, {
      'GET /pim/employees/count status 200': (r) => r.status === 200,
    });

    pageLoad.add(countRes.timings.duration, { page: 'api-pim-count' });
    errorRate.add(countRes.status !== 200 ? 1 : 0);

    sleep(1);

    if (firstEmpNumber) {
      const empRes = http.get(api(`/pim/employees/${firstEmpNumber}`), {
        headers: JSON_HEADERS,
        tags: { name: 'api-pim-employee-detail' },
      });

      check(empRes, {
        'GET /pim/employees/{id} status 200': (r) => r.status === 200,
        'GET /pim/employees/{id} has data': () => {
          const d = getJSON(empRes);
          return d && d.data && d.data.empNumber === firstEmpNumber;
        },
      });

      pageLoad.add(empRes.timings.duration, {
        page: 'api-pim-employee-detail',
      });
      errorRate.add(empRes.status !== 200 ? 1 : 0);
    }
  });

  sleep(1);

  // ─── Leave API ───────────────────────────────────────────────────
  group('Leave API', function () {
    const leaveTypesRes = http.get(api('/leave/leave-types'), {
      headers: JSON_HEADERS,
      tags: { name: 'api-leave-types' },
    });

    check(leaveTypesRes, {
      'GET /leave/leave-types status 200': (r) => r.status === 200,
    });

    pageLoad.add(leaveTypesRes.timings.duration, { page: 'api-leave-types' });
    errorRate.add(leaveTypesRes.status !== 200 ? 1 : 0);

    // Note: leave-entitlements (500) and leave-balances (500) excluded —
    // demo env has no leave data, server returns 500. Time API (403)
    // excluded — demo Admin user lacks Time module permissions.
  });

  sleep(1);
}
