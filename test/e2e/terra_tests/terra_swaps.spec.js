const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const SwapPage = require('../../pages/SwapPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()

let browser, page

const swapPairMap = [
  {
    fromAsset: 'BTC',
    toAsset: 'LUNA'
  },
  {
    fromAsset: 'LUNA',
    toAsset: 'BTC'
  }
]
describe.skip('Terra swaps-["PULL_REQUEST_TEST"]', async () => {
  swapPairMap.forEach((obj) => {
    it(`SWAP (${obj.fromAsset}->${obj.toAsset})`, async () => {
      const swapFromAsset = obj.fromAsset
      const swapToAsset = obj.toAsset

      browser = await puppeteer.launch(testUtil.getChromeOptions())
      page = await browser.newPage()
      await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 0 })
      // Import wallet option
      await homePage.ClickOnImportWallet(page)
      await homePage.ScrollToEndOfTerms(page)
      await homePage.ClickOnAcceptPrivacy(page)
      // Enter seed words and submit
      await homePage.EnterSeedWords(page)
      // Create a password & submit
      await passwordPage.SubmitPasswordDetails(page)
      // overview page
      await overviewPage.CloseWhatsNewModal(page)
      await overviewPage.HasOverviewPageLoaded(page)
      // Select testnet
      await overviewPage.SelectNetwork(page)
      // Click on from assert from overview screen then click on swap
      await overviewPage.SelectAssetFromOverview(page, swapFromAsset)
      await page.waitForSelector(`#${swapFromAsset}_swap_button`, { visible: true })
      await page.click(`#${swapFromAsset}_swap_button`)
      if (obj.toAsset !== 'BTC') {
        try {
          await swapPage.SelectSwapReceiveCoin(page)
          await page.waitForSelector('#search_for_a_currency', { visible: true, timeout: 60000 })
          await page.type('#search_for_a_currency', swapToAsset)
          await page.waitForTimeout(5000)
          await page.click(`#${swapToAsset}`)
          await page.waitForTimeout(1000)
        } catch (e) {
          if (e instanceof puppeteer.errors.TimeoutError) {
            await testUtil.takeScreenshot(page, `terra-swap-issue-${obj.fromAsset}->${obj.toAsset}`)
            expect(e, 'terra swap issue').equals(null)
          }
        }
      }
      // if (swapToAsset === 'BTC') {
      //   await swapPage.EnterSendAmountOnSwap(page, '0.01')
      // }
      await page.waitForTimeout(10000)
      try {
        await page.waitForSelector('#selectedQuote_provider', { visible: true })
        expect(
          await page.$eval('#selectedQuote_provider', (el) => el.textContent),
          `SWAP (${obj.fromAsset}->${obj.toAsset}), Liquality should be chosen!`
        ).equals('Liquality')
      } catch (e) {
        await testUtil.takeScreenshot(
          page,
          `terra-swap-quote-issue-${obj.fromAsset}-${obj.toAsset}`
        )
        expect(
          e,
          `${obj.fromAsset}->${obj.toAsset} SWAP issue, Liquality Quote service provider should be chosen`
        ).equals(null)
      }
      if (swapToAsset === 'BTC') {
        // Click on SWAP Review button
        await swapPage.clickSwapReviewButton(page)
        // Click on Initiate SWAP button
        await swapPage.ClickInitiateSwapButton(page)
        // Wait for Activity tab list of items - Transaction items
        try {
          await page.waitForSelector('.transaction-list', { visible: true, timeout: 1200000 })
          await page.waitForSelector('.transaction-steps', { visible: true, timeout: 600000 })
        } catch (e) {
          if (e instanceof puppeteer.errors.TimeoutError) {
            await testUtil.takeScreenshot(page, 'sov-btc-swap-transaction-not-found')
            expect(
              e,
              `SWAP (${obj.fromAsset}->${obj.toAsset}) transaction not found under Activity tab`
            ).equals(null)
          }
        }
        const transactionSteps = await page.$eval('.transaction-steps', (el) => el.textContent)
        expect(transactionSteps).not.contains('NaN')

        const transactions = await page.$$('.transaction-status')
        await transactions[0].click()
        await page.waitForSelector('.swap-details_info', { visible: true })
      }
      // Close
      await browser.close()
    })
  })
})
