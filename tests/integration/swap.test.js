/* eslint-env jest */
const { setup, expectWalletOpen, switchToTestnet, importWallet } = require('./utils')

let browser, page
beforeEach(async () => {
  ({ browser, page } = await setup())
})

afterEach(async () => {
  await browser.close()
})

test('Swap', async () => {
  await importWallet(page)
  await expectWalletOpen(page)
  await switchToTestnet(page)
  await expectWalletOpen(page, 'testnet')

  const ethLink = await page.$('a[href="#/account/ETH"]')
  await ethLink.click()
  const swapLink = await page.waitFor('a[href="#/account/ETH/swap"]')
  await swapLink.click()

  const minLink = await page.waitForXPath('//a[contains(text(),"Min")]')
  await minLink.click()
  await page.select('.custom-select', 'DAI')

  await page.click('.btn-primary') // Continue
  await page.click('.btn-primary') // Send

  await page.waitFor('.account_transactions')

  const status = await page.$eval('.transaction_detail', el => el.textContent)

  expect(status).toEqual('Locking ETH')
})
