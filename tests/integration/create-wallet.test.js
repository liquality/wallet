/* eslint-env jest */
const { CONSTANTS, expectWalletOpen, setup } = require('./utils')

let browser, page
beforeEach(async () => {
  ({ browser, page } = await setup())
})

afterEach(async () => {
  await browser.close()
})

test('Create new wallet', async () => {
  await page.click('.btn-primary') // Accept terms
  await page.click('.btn-light') // Create new wallet
  await page.type('#password', CONSTANTS.PASSWORD)
  await page.type('#confirmPassword', CONSTANTS.PASSWORD)
  await page.click('.btn-primary') // Submit

  // Unlocking wallet...
  await page.waitFor('.backup-wallet_seed')
  await page.click('.btn-primary') // Done

  await expectWalletOpen(page)
})
