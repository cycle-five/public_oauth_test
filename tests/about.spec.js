const { test, expect } = require('./fixtures');

test.describe('login/about.html', () => {
  test('serves 200 and documents the variants', async ({ page, serverURL }) => {
    const res = await page.goto(serverURL + '/login/about.html');
    expect(res.status()).toBe(200);
    const rows = page.locator('table#variants tr');
    for (const url of ['/login.html', '/login/any.html', '/login/spa.html']) {
      await expect(rows.filter({ hasText: url }).first()).toBeVisible();
    }
  });

  test('names selectors and public credentials', async ({ page, serverURL }) => {
    await page.goto(serverURL + '/login/about.html');
    const text = await page.locator('body').innerText();
    for (const s of ['#login-form', '#username', '#password', '#fill-report']) {
      expect(text).toContain(s);
    }
    expect(text).toContain('testuser');
    expect(text).toContain('correct-horse-battery-staple');
  });

  test('has observed-storage section and no password field', async ({ page, serverURL }) => {
    await page.goto(serverURL + '/login/about.html');
    await expect(page.locator('#observed-storage')).toHaveCount(1);
    await expect(page.locator('input[type=password]')).toHaveCount(0);
    await expect(page.locator('#username')).toHaveCount(0);
  });
});
