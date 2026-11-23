const crypto = require('crypto');
const { test, expect } = require('./fixtures');

const USER = 'testuser';
const PASS = 'correct-horse-battery-staple';
const digest = (u, p) => crypto.createHash('sha256').update(u + ':' + p, 'utf8').digest('hex');

async function open(page, serverURL, path) {
  await page.goto(serverURL + path);
  await page.waitForSelector('#login-form[data-ready="true"]');
}

async function login(page, u, p) {
  await page.fill('#username', u);
  await page.fill('#password', p);
  await page.click('#submit');
}

test('welcome with no preceding submit reports no receipt', async ({ page, serverURL }) => {
  await page.goto(serverURL + '/login/welcome.html?from=any');
  const report = page.locator('#submit-report');
  await expect(report).toHaveAttribute('data-recorded', 'false');
  expect(await report.getAttribute('data-username-length')).toBeNull();
  expect(await report.getAttribute('data-match')).toBeNull();
});

for (const [path, u, p] of [['/login.html', USER, PASS], ['/login/any.html', 'someone', 'a-long-canary-value']]) {
  test(`classic submit carries lengths to welcome: ${path}`, async ({ page, serverURL, requestLog }) => {
    await open(page, serverURL, path);
    await login(page, u, p);
    await page.waitForURL('**/login/welcome.html?from=*');
    const report = page.locator('#submit-report');
    await expect(report).toHaveAttribute('data-recorded', 'true');
    await expect(report).toHaveAttribute('data-username-length', String(u.length));
    await expect(report).toHaveAttribute('data-password-length', String(p.length));
    expect(await report.getAttribute('data-match')).toBeNull();
    // Lengths only: no value on the page, in the URL, in storage, or on the wire.
    expect(await page.content()).not.toContain(p);
    expect(page.url()).not.toContain(p);
    expect(await page.evaluate(() => JSON.stringify(sessionStorage))).not.toContain(p);
    expect(requestLog.every((r) => r.method !== 'POST' && !r.url.includes(p))).toBe(true);
    // Survives a reload of the welcome page, so a slow poll still finds it.
    await page.reload();
    await expect(page.locator('#submit-report')).toHaveAttribute('data-password-length', String(p.length));
  });
}

test('expect digest: match true and false on the classic page', async ({ page, serverURL }) => {
  const u = 'canary-user';
  const p = 'Zx9!canary–välue'; // non-ASCII on purpose: the digest is over UTF-8
  await open(page, serverURL, '/login/any.html?expect=' + digest(u, p));
  await login(page, u, p);
  await page.waitForURL('**/login/welcome.html?from=any');
  await expect(page.locator('#submit-report')).toHaveAttribute('data-match', 'true');

  await open(page, serverURL, '/login/any.html?expect=' + digest(u, p));
  await login(page, u, p + 'x');
  await page.waitForURL('**/login/welcome.html?from=any');
  await expect(page.locator('#submit-report')).toHaveAttribute('data-match', 'false');
  await expect(page.locator('#submit-report')).toHaveAttribute('data-password-length', String(p.length + 1));
});

test('malformed expect is ignored and never rendered', async ({ page, serverURL }) => {
  await open(page, serverURL, '/login/any.html?expect=%3Cscript%3Ealert(1)%3C/script%3E');
  expect(await page.content()).not.toContain('alert(1)');
  await login(page, 'a', 'b');
  await page.waitForURL('**/login/welcome.html?from=any');
  await expect(page.locator('#submit-report')).toHaveAttribute('data-recorded', 'true');
  expect(await page.locator('#submit-report').getAttribute('data-match')).toBeNull();
});

test('a failed login leaves no receipt behind', async ({ page, serverURL }) => {
  await open(page, serverURL, '/login.html');
  await login(page, USER, 'wrong');
  await page.waitForURL('**/login.html?error=wrong_password');
  await page.waitForSelector('#login-form[data-ready="true"]');
  expect(await page.evaluate(() => sessionStorage.getItem('login-test:last-submit'))).toBeNull();
  await page.goto(serverURL + '/login/welcome.html?from=strict');
  await expect(page.locator('#submit-report')).toHaveAttribute('data-recorded', 'false');
});

test('welcome ignores a receipt of the wrong shape', async ({ page, serverURL }) => {
  await page.goto(serverURL + '/login/welcome.html');
  for (const bad of ['{"u":"<b>x</b>","p":3}', '{"u":-1,"p":3}', '{"u":1.5,"p":3}', 'not json', '[]', 'null']) {
    await page.evaluate((v) => sessionStorage.setItem('login-test:last-submit', v), bad);
    await page.reload();
    await expect(page.locator('#submit-report'), bad).toHaveAttribute('data-recorded', 'false');
  }
});

test('in-page sha256 agrees with node crypto', async ({ page, serverURL }) => {
  // The function is private to the page, so it is checked through ?expect=.
  // Byte lengths 3, 55, 56, 64 and 202 straddle the padding and block edges.
  const inputs = [['a', 'b'], ['u', 'x'.repeat(53)], ['u', 'x'.repeat(54)], ['u', 'x'.repeat(62)], ['u', 'x'.repeat(200)], ['ü', '密码🔑']];
  for (const [u, p] of inputs) {
    await open(page, serverURL, '/login/spa.html?expect=' + digest(u, p));
    await login(page, u, p);
    await expect(page.locator('#submit-report'), `${u.length}/${p.length}`).toHaveAttribute('data-match', 'true');
  }
});

test('spa: receipt in the logged-in panel', async ({ page, serverURL }) => {
  await open(page, serverURL, '/login/spa.html');
  await login(page, 'someone', 'secret-value');
  const report = page.locator('#logged-in #submit-report');
  await expect(report).toHaveAttribute('data-recorded', 'true');
  await expect(report).toHaveAttribute('data-username-length', '7');
  await expect(report).toHaveAttribute('data-password-length', '12');
  expect(await page.locator('body').innerText()).not.toContain('secret-value');
});
