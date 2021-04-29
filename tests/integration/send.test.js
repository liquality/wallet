/* eslint-env jest */
const { CONSTANTS, setup, expectWalletOpen, switchToTestnet, importWallet } = require('./utils')

let browser, page
beforeEach(async () => {
  ({ browser, page } = await setup())
})

afterEach(async () => {
  await browser.close()
})

test('Send transaction', async () => {
  await importWallet(page)
  await expectWalletOpen(page)
  await switchToTestnet(page)
  await expectWalletOpen(page, 'testnet')

  const ethLink = await page.$('a[href="#/accounts/ETH"]')
  await ethLink.click()
  const sendLink = await page.waitFor('a[href="#/accounts/ETH/send"]')
  await sendLink.click()

  await page.type('#address', CONSTANTS.ETH_ADDRESS)
  await page.type('#amount', '0.000001')

  await page.click('.btn-primary') // Continue
  await page.click('.btn-primary') // Send

  await page.waitFor('.account_transactions')

  const action = await page.$eval('.transaction_action', el => el.textContent)
  const amount = await page.$eval('.transaction_amount', el => el.textContent)

  expect(action).toEqual('Send ETH')
  expect(amount).toEqual('0.000001 ETH')
})
