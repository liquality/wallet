/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  // globalSetup: require.resolve('./tests/playwright_tests/global-setup.js'),
  testDir: './tests/playwright_tests',
  timeout: 30000,
  globalTimeout: 600000,
  ignoreHTTPSErrors: true,
  screenshot: 'only-on-failure',
  video: 'on-first-retry',
  trace: 'retain-on-failure',
  workers: 5,
  reporter: [
    ['line'],
    ['allure-playwright']
  ],
  use: {
    browserName: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry'
  }
}

module.exports = config
