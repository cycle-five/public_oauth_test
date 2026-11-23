const { test, expect } = require('./fixtures');

const USER = 'testuser';
const PASS = 'correct-horse-battery-staple';

// Simulates a page that never reaches the controlled state.
async function blockWorker(page) {
  await page.addInitScript(() => {
    ServiceWorkerContainer.prototype.register = () => new Promise(() => {});
  });
}

async function open(page, serverURL, path) {
  await page.goto(serverURL + path);
  await page.waitForSelector('#login-form[data-ready="true"]');
}

// The pages' CSP (default-src 'none') forbids fetch(), so endpoints are
// exercised the way a user does: by submitting the real form.
async function submitAs(page, serverURL, pagePath, fields) {
  await open(page, serverURL, pagePath);
  await page.fill('#username', fields.username);
  await page.fill('#password', fields.password);
  await page.click('#submit');
}

test.describe('worker endpoints', () => {
  const cases = [
    ['strict public pair', '/login/session/strict', { username: USER, password: PASS }, '/login/welcome.html?from=strict'],
    ['strict wrong pw', '/login/session/strict', { username: USER, password: 'nope' }, '/login.html?error=wrong_password'],
    ['strict unknown user', '/login/session/strict', { username: 'bob', password: PASS }, '/login.html?error=unknown_username'],
    ['strict empty', '/login/session/strict', { username: '', password: '' }, '/login.html?error=missing'],
    ['any random pair', '/login/session/any', { username: 'a', password: 'b' }, '/login/welcome.html?from=any'],
    ['any empty', '/login/session/any', { username: '', password: 'b' }, '/login/any.html?error=missing'],
  ];
  for (const [name, endpoint, fields, expected] of cases) {
    test(name, async ({ page, serverURL, requestLog }) => {
      await submitAs(page, serverURL, endpoint.endsWith('any') ? '/login/any.html' : '/login.html', fields);
      await page.waitForURL(serverURL + expected);
      expect(requestLog.every((r) => r.method !== 'POST')).toBe(true);
    });
  }

  test('non-endpoint requests are untouched (reach the server)', async ({ page, serverURL, requestLog }) => {
    await open(page, serverURL, '/login.html');
    await page.goto(serverURL + '/login/welcome.html?from=strict');
    expect(requestLog.some((r) => r.method === 'GET' && r.url.startsWith('/login/welcome.html'))).toBe(true);
  });
});

test('fieldset disabled at first paint, enabled after control', async ({ page: first, serverURL }) => {
  await blockWorker(first); // keep it unready
  await first.goto(serverURL + '/login.html');
  expect(await first.evaluate(() => document.querySelector('#login-form fieldset').disabled)).toBe(true);
  const page = await first.context().newPage(); // no init script on this one
  await page.goto(serverURL + '/login.html');
  await page.waitForSelector('#login-form[data-ready="true"]');
  expect(await page.evaluate(() => document.querySelector('#login-form fieldset').disabled)).toBe(false);
  expect(await page.getAttribute('#login-status', 'data-state')).toBe('idle');
});

test('strict real submit success', async ({ page, serverURL, requestLog }) => {
  await open(page, serverURL, '/login.html');
  await page.fill('#username', USER);
  await page.fill('#password', PASS);
  await page.click('#submit');
  await page.waitForURL('**/login/welcome.html?from=strict');
  await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'success');
  expect(await page.evaluate(() => document.querySelector('input[type=password]'))).toBeNull();
  expect(requestLog.every((r) => r.method !== 'POST')).toBe(true);
});

test('strict wrong password via real submit', async ({ page, serverURL, requestLog }) => {
  await open(page, serverURL, '/login.html');
  await page.fill('#username', USER);
  await page.fill('#password', 'bad');
  await page.click('#submit');
  await page.waitForURL('**/login.html?error=wrong_password');
  await page.waitForSelector('#login-form[data-ready="true"]');
  await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#login-status-text')).toHaveText('Wrong password');
  expect(requestLog.every((r) => r.method !== 'POST')).toBe(true);
});

test('strict unknown user via real submit', async ({ page, serverURL }) => {
  await open(page, serverURL, '/login.html');
  await page.fill('#username', 'nobody');
  await page.fill('#password', PASS);
  await page.click('#submit');
  await page.waitForURL('**/login.html?error=unknown_username');
  await page.waitForSelector('#login-form[data-ready="true"]');
  await expect(page.locator('#login-status-text')).toHaveText('Unknown username');
  await expect(page.locator('#login-form')).toBeVisible();
});

test('any real submit', async ({ page, serverURL, requestLog }) => {
  await open(page, serverURL, '/login/any.html');
  await page.fill('#username', 'whoever');
  await page.fill('#password', 'whatever');
  await page.click('#submit');
  await page.waitForURL('**/login/welcome.html?from=any');
  await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('a#logout')).toHaveAttribute('href', '/login/any.html');
  expect(requestLog.every((r) => r.method !== 'POST')).toBe(true);
});

test('welcome page', async ({ page, serverURL }) => {
  await page.goto(serverURL + '/login/welcome.html?from=strict');
  expect(await page.locator('#username').count()).toBe(0);
  expect(await page.locator('input[type=password]').count()).toBe(0);
  await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'success');
  expect(await page.getAttribute('#logout', 'href')).toMatch(/\/login\.html$/);

  const dialogs = [];
  page.on('dialog', (d) => { dialogs.push(d); d.dismiss(); });
  await page.goto(serverURL + '/login/welcome.html?from=%3Cscript%3Ealert(1)%3C/script%3E');
  expect(await page.getAttribute('#logout', 'href')).toBe('/login.html');
  expect(await page.locator('script:not(:empty)').count()).toBe(1); // only the page's own script
  expect(dialogs.length).toBe(0);
});

test('fieldset excludes credentials before ready (check 7)', async ({ page, serverURL, requestLog }) => {
  await blockWorker(page);
  await page.goto(serverURL + '/login.html');
  const res = await page.evaluate(() => {
    document.getElementById('username').value = 'testuser';
    document.getElementById('password').value = 'correct-horse-battery-staple';
    return {
      keys: [...new FormData(document.getElementById('login-form')).keys()],
      state: document.getElementById('login-status').dataset.state,
    };
  });
  expect(res.keys).not.toContain('username');
  expect(res.keys).not.toContain('password');
  expect(res.state).toBe('not_ready');
  expect(requestLog.every((r) => r.method !== 'POST')).toBe(true);
});

for (const p of ['/login.html', '/login/any.html']) {
  test(`required selectors on ${p}`, async ({ page, serverURL }) => {
    await open(page, serverURL, p);
    for (const sel of ['#login-form', '#username', '#password', '#submit', '#login-status[data-state]', '#login-status-text', '#fill-report[data-username-length][data-password-length]']) {
      expect(await page.locator(sel).count(), sel).toBe(1);
    }
    await page.fill('#username', 'abc');
    await page.fill('#password', 'de');
    await expect(page.locator('#fill-report')).toHaveAttribute('data-username-length', '3');
    await expect(page.locator('#fill-report')).toHaveAttribute('data-password-length', '2');
    expect(await page.getAttribute('#login-form', 'method')).toBe('post');
  });
}

test('scope /login does not control /index.html', async ({ page, serverURL }) => {
  await open(page, serverURL, '/login.html');
  expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  await page.goto(serverURL + '/index.html');
  expect(await page.evaluate(() => navigator.serviceWorker.controller)).toBeNull();
});

test('query injection is not rendered', async ({ page, serverURL }) => {
  const dialogs = [];
  page.on('dialog', (d) => { dialogs.push(d); d.dismiss(); });
  await open(page, serverURL, '/login.html?error=%3Cscript%3Ealert(1)%3C/script%3E');
  await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'idle');
  const html = await page.content();
  expect(html).not.toContain('alert(1)');
  expect(dialogs.length).toBe(0);
});
