const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const SeedWordsPage = require('../pages/SeedWordsPage')
const ReceivePage = require('../pages/ReceivePage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const seedWordsPage = new SeedWordsPage()
const receivePage = new ReceivePage()

let browser, page
const password = '123123123'

/**
 * Import Wallet & Test Receive QR & address.
 * @param bitcoin
 * @returns {Promise<void>}
 */
async function importWalletTestReceive(bitcoin) {
  // Select code
  await overviewPage.SelectAssetFromOverview(page, bitcoin)
  // Validate details about assert on overview page
  await overviewPage.CheckAssertOverviewDetails(page, bitcoin)
  // Click on Receive
  await overviewPage.ClickChainReceive(page, bitcoin)
  // Receive validations
  const yourCurrentAddress = await page.$eval('#your_current_asset_address', (el) => el.textContent)
  expect(yourCurrentAddress).contains(bitcoin)
  await receivePage.HasQRCodeDisplayed(page)
  if (
    bitcoin === 'ETH' ||
    bitcoin === 'ARBETH' ||
    bitcoin === 'AVAX' ||
    bitcoin === 'RBTC' ||
    bitcoin === 'BNB' ||
    bitcoin === 'MATIC' ||
    bitcoin === 'ARBETH' ||
    bitcoin === 'LUNA'
  ) {
    await receivePage.CheckReceiveURL(page)
  }
  await receivePage.CheckReceiveAddresses(page)
  await receivePage.ClickCopyAddress(page)
  await receivePage.ClickDone(page)
  // After Click on Done
  await overviewPage.CheckAssertOverviewDetails(page, bitcoin)
  // Click on Header logo
  await page.click('#wallet_header_logo')
}

describe('Receive tokens ["MAINNET"]', async () => {
  describe('Create wallet and Check receive["PULL_REQUEST_TEST"]', async () => {
    beforeEach(async () => {
      browser = await puppeteer.launch(testUtil.getChromeOptions())
      page = await browser.newPage()
      await page.setDefaultNavigationTimeout(0)
      await page.goto(testUtil.extensionRootUrl, { waitUntil: 'networkidle2' })
    })
    afterEach(async () => {
      await browser.close()
    })
    it('Create a new wallet and check Receive for BTC["PULL_REQUEST_TEST"]', async () => {
      // Create new wallet
      await homePage.ClickOnCreateNewWallet(page)
      // Terms & conditions
      await homePage.ScrollToEndOfTerms(page)
      await homePage.ClickOnAcceptPrivacy(page)
      // Unlocking wallet...
      const seed1 = (await seedWordsPage.GetBackupSeedWords(page)).seed1
      const seed5 = (await seedWordsPage.GetBackupSeedWords(page)).seed5
      const seed12 = (await seedWordsPage.GetBackupSeedWords(page)).seed12
      // Click Next
      await seedWordsPage.ClickOnWalletNextButton(page)
      // Enter seed1,5,.12
      await seedWordsPage.EnterSeedWords(page, seed1, seed5, seed12)
      await seedWordsPage.ClickContinueButton(page)
      // Set password & click next
      await passwordPage.SubmitPasswordDetails(page, password)
      // overview page
      await overviewPage.HasOverviewPageLoaded(page)
      await overviewPage.CloseWatsNewModal(page)
      // check Send & Swap & Receive options have been displayed
      await overviewPage.ValidateSendSwipeReceiveOptions(page)
      // Select BTC
      await overviewPage.SelectAssetFromOverview(page, 'BTC')
      await overviewPage.ClickChainReceive(page, 'BTC')
      // Receive validations
      await receivePage.HasQRCodeDisplayed(page)
      await receivePage.CheckReceiveAddresses(page)
      await receivePage.ClickCopyAddress(page)
      // Click on Done button, user takes back to main screen
      await receivePage.ClickDone(page)
      await overviewPage.CheckAssertOverviewDetails(page, 'BTC')
    })
  })
  const tokens = [
    'BTC',
    'ETH',
    'DAI',
    'BNB',
    'NEAR',
    'ARBETH',
    'RBTC',
    'SOV',
    'MATIC',
    'PWETH',
    'ARBETH',
    'AVAX',
    'LUNA',
    'UST'
  ]
  describe('Import wallet, Receive tokens', async () => {
    beforeEach(async () => {
      browser = await puppeteer.launch(testUtil.getChromeOptions())
      page = await browser.newPage()
      await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 60000 })
      // Import wallet option
      await homePage.ClickOnImportWallet(page)
      await homePage.ScrollToEndOfTerms(page)
      await homePage.ClickOnAcceptPrivacy(page)
      // Enter seed words and submit
      await homePage.EnterSeedWords(page)
      // Create a password & submit
      await passwordPage.SubmitPasswordDetails(page, password)
      // overview page
      await overviewPage.CloseWatsNewModal(page)
      await overviewPage.HasOverviewPageLoaded(page)
      // Select Network
      await overviewPage.SelectNetwork(page, 'mainnet')
      // check Send & Swap & Receive options have been displayed
      await overviewPage.ValidateSendSwipeReceiveOptions(page)
    })

    afterEach(async () => {
      await browser.close()
    })

    tokens.forEach((token) => {
      it(`Check Receive for ${token}`, async () => {
        await importWalletTestReceive(`${token}`)
      })
    })
  })
})
