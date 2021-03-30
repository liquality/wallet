
/* eslint-env jest */
const { CONSTANTS, setup, expectWalletOpen, importWallet } = require('./utils')

let browser, page
beforeEach(async () => {
  ({ browser, page } = await setup())
})

afterEach(async () => {
  await browser.close()
})

test('Import wallet', async () => {
  await importWallet(page)

  await expectWalletOpen(page)

  const ethLink = await page.$('a[href="#/accounts/ETH"]')
  await ethLink.click()
  const receiveLink = await page.waitFor('a[href="#/accounts/ETH/receive"]')
  await receiveLink.click()

  // Validate using address
  await page.waitFor('.receive_address:not(:empty)')
  const address = await page.$eval('.receive_address', el => el.textContent)
  expect(address).toEqual(CONSTANTS.ETH_ADDRESS)
})
