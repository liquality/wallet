/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests/playwright_tests',
  timeout: 30000,
  globalTimeout: 600000,
  ignoreHTTPSErrors: true,
  screenshot: 'only-on-failure',
  video: 'on-first-retry',
  trace: 'retain-on-failure',
  workers: 5,
  use: {
    browserName: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry'
  }
}

module.exports = config
