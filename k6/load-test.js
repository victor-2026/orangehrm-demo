import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

const errorRate = new Rate('errors');
const pageLoad = new Trend('page_load_ms');

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    page_load_ms: ['p(95)<2000'],
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  group('Login', function () {
    const loginRes = http.post(
      `${BASE_URL}/web/index.php/auth/validate`,
      {
        username: 'Admin',
        password: 'admin123',
        _token: 'dummy',
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        tags: { name: 'login' },
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

  group('Dashboard', function () {
    const res = http.get(`${BASE_URL}/web/index.php/dashboard/index`, {
      tags: { name: 'dashboard' },
    });

    check(res, {
      'dashboard status 200': (r) => r.status === 200,
      'dashboard has widgets': (r) => r.body.includes('oxd-grid'),
    });

    pageLoad.add(res.timings.duration, { page: 'dashboard' });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(2);

  group('PIM Employee List', function () {
    const res = http.get(`${BASE_URL}/web/index.php/pim/viewEmployeeList`, {
      tags: { name: 'pim' },
    });

    check(res, {
      'pim status 200': (r) => r.status === 200,
      'pim has employee table': (r) => r.body.includes('oxd-table'),
    });

    pageLoad.add(res.timings.duration, { page: 'pim' });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(2);

  group('Leave List', function () {
    const res = http.get(`${BASE_URL}/web/index.php/leave/viewLeaveList`, {
      tags: { name: 'leave' },
    });

    check(res, {
      'leave status 200': (r) => r.status === 200,
    });

    pageLoad.add(res.timings.duration, { page: 'leave' });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(2);

  group('Admin Users', function () {
    const res = http.get(`${BASE_URL}/web/index.php/admin/viewSystemUsers`, {
      tags: { name: 'admin' },
    });

    check(res, {
      'admin status 200': (r) => r.status === 200,
    });

    pageLoad.add(res.timings.duration, { page: 'admin' });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(1);
}

export function smokeTest() {
  const opts = {
    vus: 2,
    duration: '30s',
  };
  return opts;
}
