const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const SwapPage = require('../pages/SwapPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()

let browser, page
const password = '123123123'
const liqualityBooster = 'Liquality Boost'

// https://docs.google.com/spreadsheets/d/18c-B2jYeyxoRTNI0yuFWsltSXYQ3quObxacXEx42N5g/edit#gid=0
if (process.env.NODE_ENV === 'mainnet') {
  // eslint-disable-next-line no-inner-declarations
  async function checkBooster () {
    try {
      await page.waitForSelector('#selectedQuote_provider', { visible: true })
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'Liquality Boost source should be chosen!')
        .oneOf([liqualityBooster])
      console.log(('Liquality Boost Quote loaded successfully'))
    } catch (e) {
      await testUtil.takeScreenshot(page, 'liqualityBoost-rate-provider-issue')
      expect(e, 'Liquality Boost should chosen').equals(null)
    }
  }
  // Only works on Mainnet
  describe('Liquality Booster-[mainnet]', async () => {
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
    })
    afterEach(async () => {
      try {
        await page.close()
        await browser.close()
      } catch (e) {
        throw new Error(e)
      }
    })
    it.skip('SWAP (BTC->PUSDC (Polygon))', async () => {
      const assert1 = 'BTC'
      const assert2 = 'PUSDC'
      // Select testnet
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click on BTC then click on SWAP button
      await overviewPage.SelectAssetFromOverview(page, assert1)
      await page.waitForSelector(`#${assert1}_swap_button`, { visible: true })
      await page.click(`#${assert1}_swap_button`)
      // Select PUSDC
      await swapPage.SelectSwapReceiveCoin(page)
      await page.waitForSelector('#search_for_a_currency', { visible: true })
      await page.type('#search_for_a_currency', assert2)
      await page.click(`#${assert2}`)
      if (process.env.NODE_AGENT === 'prodagent') {
        await swapPage.EnterSendAmountOnSwap(page, '0.01')
      } else {
        await swapPage.EnterSendAmountOnSwap(page, '0.00001')
      }
      await page.waitForSelector('#see_all_quotes', { visible: true })
      await swapPage.ClickOnMin(page)

      // Select Liquality Boost
      await page.waitForSelector('#see_all_quotes', { visible: true })
      await page.click('#see_all_quotes')
      await page.waitForSelector('#liqualityBoost_rate_provider', { visible: true })
      await page.click('#liqualityBoost_rate_provider')
      await page.click('#select_quote_button')
      // Check source name
      await checkBooster()
    })
    it('SWAP (BTC->PUSDT (Polygon))', async () => {
      const assert1 = 'BTC'
      const assert2 = 'PUSDT'
      // Select testnet
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click on BTC then click on SWAP button
      await overviewPage.SelectAssetFromOverview(page, assert1)
      await page.waitForSelector(`#${assert1}_swap_button`, { visible: true })
      await page.click(`#${assert1}_swap_button`)
      // Select PUSDT
      await swapPage.SelectSwapReceiveCoin(page)
      await page.waitForSelector('#search_for_a_currency', { visible: true })
      await page.type('#search_for_a_currency', assert2)
      await page.click(`#${assert2}`)
      if (process.env.NODE_AGENT === 'prodagent') {
        await swapPage.EnterSendAmountOnSwap(page, '0.01')
      } else {
        await swapPage.EnterSendAmountOnSwap(page, '0.00001')
      }
      // Select Liquality Boost
      try {
        await page.waitForSelector('#selectedQuote_provider', { visible: true })
      } catch (e) {
        await testUtil.takeScreenshot(page, 'no-Liquidity')
        expect(e, 'No Liquidity.....').equals(null)
      }
      await page.waitForTimeout(5000)
      try {
        const selectedQuoteProviderText = await page.$eval('#selectedQuote_provider', (el) => el.textContent)
        if (selectedQuoteProviderText === liqualityBooster) {
          // Check source name
          await checkBooster()
        } else if (selectedQuoteProviderText === 'Liquality') {
          await page.click('#see_all_quotes')
          await page.waitForSelector('#liqualityBoost_rate_provider', { visible: true })
          await page.click('#liqualityBoost_rate_provider')
          await page.click('#select_quote_button')
          // Check source name
          await checkBooster()
        }
      } catch (e) {
        await testUtil.takeScreenshot(page, 'liqualityBooster-selected-error')
        expect(e, 'Liquality Boost selected quote provider error!!').equals(null)
      }
    })
  })
}
