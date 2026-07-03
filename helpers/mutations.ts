import { Page } from '@playwright/test';

export const MUTATIONS: Record<string, string> = {
  '1': 'API 404 — PUT /config endpoint removed',
  '2': 'API 500 — POST /registrations crashes',
  '3': 'Toggle state lost — PUT succeeds but toggle reverts on reload',
  '4': 'Validation text changed — "Required" → "Mandatory" in API responses',
  '5': 'API slow — 10s delay on all workspace notification requests',
  '6': 'Page heading changed — title mutated in HTML response',
};

export async function applyMutation(page: Page, mutationId: string | undefined): Promise<void> {
  if (!mutationId) return;

  let toggleWasOn = false;

  await page.route('**/api/v2/admin/workspace-notification/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    switch (mutationId) {
      case '1': {
        if (url.includes('workspace-notification/config') && method === 'PUT') {
          await route.fulfill({ status: 404, body: 'Not Found' });
          return;
        }
        break;
      }
      case '2': {
        if (url.includes('workspace-notification/registrations') && method === 'POST') {
          await route.fulfill({ status: 500, body: 'Internal Server Error' });
          return;
        }
        break;
      }
      case '3': {
        if (method === 'GET' && url.includes('workspace-notification/config')) {
          const body = JSON.stringify({ data: { enabled: toggleWasOn } });
          await route.fulfill({ status: 200, contentType: 'application/json', body });
          return;
        }
        if (method === 'PUT' && url.includes('workspace-notification/config')) {
          toggleWasOn = !toggleWasOn;
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { enabled: toggleWasOn } }) });
          return;
        }
        break;
      }
      case '4': {
        const response = await route.fetch();
        const body = await response.text();
        const mutated = body.replace(/Required/g, 'Mandatory');
        await route.fulfill({ response, body: mutated });
        return;
      }
      case '5': {
        await new Promise(r => setTimeout(r, 10000));
        await route.fetch();
        return;
      }
      case '6': {
        if (url.includes('.html') || url.includes('/web/')) {
          const response = await route.fetch();
          const body = await response.text();
          const mutated = body.replace(/Workspace Notification Configuration/g, 'Wkspc Notification Config');
          await route.fulfill({ response, body: mutated });
          return;
        }
        break;
      }
    }
    await route.fetch();
  });
}
