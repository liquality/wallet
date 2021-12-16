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
const password = '123123123'

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
describe('Terra swaps-[smoke,testnet]', async () => {
  swapPairMap.forEach(obj => {
    it(`SWAP (${obj.fromAsset}->${obj.toAsset})`, async () => {
      const swapFromAsset = obj.fromAsset
      const swapToAsset = obj.toAsset

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
      // Select testnet
      await overviewPage.SelectNetwork(page)
      // Click on BTC then click on SWAP button
      await overviewPage.SelectAssetFromOverview(page, swapFromAsset)
      await page.waitForSelector(`#${swapFromAsset}_swap_button`, { visible: true })
      await page.click(`#${swapFromAsset}_swap_button`)
      // Select PUSDT
      try {
        await swapPage.SelectSwapReceiveCoin(page)
        await page.waitForSelector('#search_for_a_currency', { visible: true, timeout: 60000 })
        await page.type('#search_for_a_currency', swapToAsset, { delay: 60000 })
        await page.click(`#${swapToAsset}`)
      } catch (e) {
        if (e instanceof puppeteer.errors.TimeoutError) {
          await testUtil.takeScreenshot(page, `${swapToAsset}-swap-issue`)
          expect(e, `${swapFromAsset} to ${swapToAsset} swap issue`).equals(null)
        }
      }
      if (swapToAsset === 'BTC') {
        await swapPage.EnterSendAmountOnSwap(page, '0.01')
      }
      await page.waitForTimeout(10000)
      await page.waitForSelector('#selectedQuote_provider', { visible: true })
      try {
        expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
          `SWAP (${obj.fromAsset}->${obj.toAsset}), Liquality should be chosen!`)
          .oneOf(['Liquality'])
      } catch (e) {
        await testUtil.takeScreenshot(page, `${obj.fromAsset}->${obj.toAsset})-swap-issue`)
        expect(e, 'Liquality should be chosen').equals(null)
      }
      if (swapToAsset === 'BTC') {
        // Click on SWAP Review button
        await swapPage.ClickSwapReviewButton(page)
        // Click on Initiate SWAP button
        await swapPage.ClickInitiateSwapButton(page)
        // Wait for Activity tab list of items - Transaction items
        try {
          await page.waitForSelector('.transaction-list', { visible: true, timeout: 1200000 })
          await page.waitForSelector('.transaction-steps', { visible: true, timeout: 600000 })
        } catch (e) {
          if (e instanceof puppeteer.errors.TimeoutError) {
            await testUtil.takeScreenshot(page, 'sov-btc-swap-transaction-not-found')
            expect(e, `SWAP (${obj.fromAsset}->${obj.toAsset}) transaction not found under Activity tab`).equals(null)
          }
        }
        const transactionSteps = await page.$eval('.transaction-steps', el => el.textContent)
        expect(transactionSteps).not.contains('NaN')

        const transactions = await page.$$('.transaction-status')
        await transactions[0].click()
        await page.waitForSelector('.swap-details_info', { visible: true })
      }
      // Close
      try {
        await page.close()
        await browser.close()
      } catch (e) {
        throw new Error(e)
      }
    })
  })
})
