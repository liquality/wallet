const { test, expect, chromium } = require('@playwright/test')

const PlaywrightTestUtils = require('./playwight-test-utils')
const testUtils = new PlaywrightTestUtils()

let page
let browser

test.beforeAll(async () => {
  const userDataDir = testUtils.extensionPathBuildPath
  browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
      '--window-size=1920,1080',
      '--disable-notifications',
      '--disable-extensions',
      '--disable-extensions-file-access-check',
      '-disable-popup-blocking',
      '--disable-extensions-except=' + userDataDir,
      '--load-extension=' + userDataDir
    ]
  })
  page = await browser.newPage()
  await page.goto(testUtils.extensionRootUrl, { waitUntil: 'load', timeout: 60000 })
})

test.afterAll(async () => {
  await browser.close()
})
test.only('playwright chrome wallet test new new', async () => {
  const importWallet = await page.waitForSelector('#import_with_seed_phrase_option')
  await importWallet.click()
  const termsPrivacyAcceptButton = await page.isVisible('#terms_privacy_accept_button')
  await expect(termsPrivacyAcceptButton).toBeTruthy
})
