const fs = require('fs');
const path = require('path');
const { test, expect } = require('./fixtures');

test('GET / returns 200 serving index.html', async ({ request, serverURL }) => {
  const res = await request.get(serverURL + '/');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('text/html');
  const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  expect(await res.text()).toBe(index);
});

test('no service worker controls /index.html', async ({ page, serverURL }) => {
  await page.goto(serverURL + '/index.html');
  const controller = await page.evaluate(() => navigator.serviceWorker.controller);
  expect(controller).toBeNull();
});

test('requestLog records GET requests', async ({ page, serverURL, requestLog }) => {
  await page.goto(serverURL + '/index.html');
  expect(requestLog.length).toBeGreaterThan(0);
  expect(requestLog.some((r) => r.method === 'GET')).toBe(true);
});
