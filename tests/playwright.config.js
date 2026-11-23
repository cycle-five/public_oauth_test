const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  // serviceWorkers left at the default ('allow') so tests can register workers.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
