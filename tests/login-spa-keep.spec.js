const { test, expect } = require('./fixtures');

async function open(page, serverURL) {
  await page.goto(serverURL + '/login/spa-keep.html');
  await page.waitForSelector('#login-form[data-ready="true"]');
}

test('required selectors', async ({ page, serverURL }) => {
  await open(page, serverURL);
  for (const sel of ['#login-form', '#username', '#password', '#submit', '#login-status[data-state]', '#login-status-text', '#fill-report[data-username-length][data-password-length]', '#submit-report[data-recorded="false"]']) {
    expect(await page.locator(sel).count(), sel).toBe(1);
  }
  await expect(page.locator('#submit-report')).toBeHidden();
  await expect(page.locator('#logout')).toBeHidden();
  expect(await page.getAttribute('#username', 'autocomplete')).toBe('username');
  expect(await page.getAttribute('#password', 'autocomplete')).toBe('current-password');
});

test('success keeps the filled form: same document, same URL, values intact', async ({ page, serverURL, requestLog }) => {
  await open(page, serverURL);
  await page.evaluate(() => { window.__sentinel = 'same-document'; });
  await page.fill('#username', 'someone');
  await page.fill('#password', 'secret-value');
  await page.click('#submit');
  await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('#login-form')).toHaveAttribute('data-logged-in', 'true');
  await expect(page.locator('#login-form')).toBeVisible();
  expect(await page.inputValue('#username')).toBe('someone');
  expect(await page.inputValue('#password')).toBe('secret-value');
  expect(await page.isEnabled('#password')).toBe(true);
  await expect(page.locator('#fill-report')).toHaveAttribute('data-password-length', '12');
  await expect(page.locator('#submit-report')).toBeVisible();
  await expect(page.locator('#submit-report')).toHaveAttribute('data-username-length', '7');
  await expect(page.locator('#submit-report')).toHaveAttribute('data-password-length', '12');
  await expect(page.locator('#logout')).toHaveAttribute('href', '/login/spa-keep.html');
  expect(page.url()).toBe(serverURL + '/login/spa-keep.html');
  expect(await page.evaluate(() => window.__sentinel)).toBe('same-document');
  expect(requestLog.every((r) => r.method !== 'POST')).toBe(true);
  expect(requestLog.filter((r) => r.url.startsWith('/login/api/'))).toEqual([]);
});

for (const how of ['with events', 'silently']) {
  test(`a scrub after success shows in fill-report, receipt unchanged (${how})`, async ({ page, serverURL }) => {
    await open(page, serverURL);
    await page.fill('#username', 'someone');
    await page.fill('#password', 'secret-value');
    await page.click('#submit');
    await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'success');
    await page.evaluate((events) => {
      for (const id of ['username', 'password']) {
        const el = document.getElementById(id);
        el.value = '';
        if (events) el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, how === 'with events');
    await expect(page.locator('#fill-report')).toHaveAttribute('data-username-length', '0');
    await expect(page.locator('#fill-report')).toHaveAttribute('data-password-length', '0');
    await expect(page.locator('#submit-report')).toHaveAttribute('data-password-length', '12');
    await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'success');
  });
}

test('failure keeps form and reports error, also after an earlier success', async ({ page, serverURL }) => {
  await open(page, serverURL);
  await page.fill('#username', 'someone');
  await page.click('#submit');
  await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#submit-report')).toBeHidden();
  await page.fill('#password', 'pw');
  await page.click('#submit');
  await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'success');
  await page.fill('#password', '');
  await page.click('#submit');
  await expect(page.locator('#login-status')).toHaveAttribute('data-state', 'error');
  expect(await page.getAttribute('#login-form', 'data-logged-in')).toBeNull();
});
