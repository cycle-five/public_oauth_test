const { test, expect } = require('./fixtures');

async function open(page, serverURL) {
  await page.goto(serverURL + '/login/spa.html');
  await page.waitForSelector('#login-form[data-ready="true"]');
}

test('required selectors (check 8)', async ({ page, serverURL }) => {
  await open(page, serverURL);
  for (const sel of ['#login-form', '#username', '#password', '#submit', '#login-status[data-state]', '#login-status-text', '#fill-report[data-username-length][data-password-length]']) {
    expect(await page.locator(sel).count(), sel).toBe(1);
  }
  expect(await page.getAttribute('#username', 'autocomplete')).toBe('username');
  expect(await page.getAttribute('#password', 'autocomplete')).toBe('current-password');
  await page.fill('#username', 'abc');
  await page.fill('#password', 'de');
  await expect(page.locator('#fill-report')).toHaveAttribute('data-username-length', '3');
  await expect(page.locator('#fill-report')).toHaveAttribute('data-password-length', '2');
});

test('fieldset disabled at first paint, enabled after control (check 2)', async ({ page: first, serverURL }) => {
  await first.addInitScript(() => {
    ServiceWorkerContainer.prototype.register = () => new Promise(() => {});
  });
  await first.goto(serverURL + '/login/spa.html');
  expect(await first.evaluate(() => document.querySelector('#login-form fieldset').disabled)).toBe(true);
  expect(await first.getAttribute('#login-status', 'data-state')).toBe('not_ready');
  const page = await first.context().newPage();
  await page.goto(serverURL + '/login/spa.html');
  await page.waitForSelector('#login-form[data-ready="true"]');
  expect(await page.evaluate(() => document.querySelector('#login-form fieldset').disabled)).toBe(false);
  expect(await page.getAttribute('#login-status', 'data-state')).toBe('idle');
});

test('random pair: form removed, logged-in panel, pushState, no navigation (checks 5, 6)', async ({ page, serverURL, requestLog }) => {
  await open(page, serverURL);
  await page.evaluate(() => { window.__sentinel = 'same-document'; });
  await page.fill('#username', 'u' + Math.random().toString(36).slice(2));
  await page.fill('#password', 'p' + Math.random().toString(36).slice(2));
  await page.click('#submit');
  await expect(page.locator('#logged-in')).toBeVisible();
  expect(await page.locator('#login-form').count()).toBe(0);
  expect(await page.locator('#username').count()).toBe(0);
  expect(page.url()).toBe(serverURL + '/login/spa.html#in');
  // Same document: the sentinel survives, so nothing reloaded.
  expect(await page.evaluate(() => window.__sentinel)).toBe('same-document');
  await expect(page.locator('#logout')).toHaveAttribute('href', '/login/spa.html');
  expect(requestLog.every((r) => r.method !== 'POST')).toBe(true);
  expect(requestLog.filter((r) => r.url.startsWith('/login/api/'))).toEqual([]);
});

for (const [name, u, p] of [['empty username', '', 'pw'], ['empty password', 'someone', ''], ['both empty', '', '']]) {
  test(`failure keeps form: ${name}`, async ({ page, serverURL, requestLog }) => {
    await open(page, serverURL);
    await page.fill('#username', u);
    await page.fill('#password', p);
    await page.click('#submit');
    await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#login-status-text')).toHaveText('Enter a username and a password');
    expect(await page.locator('#login-form').count()).toBe(1);
    expect(page.url()).toBe(serverURL + '/login/spa.html');
    expect(requestLog.every((r) => r.method !== 'POST')).toBe(true);
  });
}
