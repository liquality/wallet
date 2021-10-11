const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const SwapPage = require('../Pages/SwapPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()

let browser, page
const password = '123123123'

if (process.env.NODE_ENV === 'mainnet') {
// Only works on Mainnet
  describe.skip('Liquality Booster-[mainnet]', async () => {
    beforeEach(async () => {
      browser = await puppeteer.launch(testUtil.getChromeOptions())
      page = await browser.newPage()
      await page.goto(testUtil.extensionRootUrl)
      await homePage.ScrollToEndOfTerms(page)
      await homePage.ClickOnAcceptPrivacy(page)
      // Import wallet option
      await homePage.ClickOnImportWallet(page)
      // Enter seed words and submit
      await homePage.EnterSeedWords(page)
      // Create a password & submit
      await passwordPage.SubmitPasswordDetails(page, password)
    })
    afterEach(async () => {
      try {
        await page.close()
        await browser.close()
      } catch (e) {
        throw new Error(e)
      }
    })
    it('SWAP (BTC->USDC)', async () => {
      const assert1 = 'BTC'
      const assert2 = 'USDC'
      // overview page
      await overviewPage.HasOverviewPageLoaded(page)
      await overviewPage.CloseWatsNewModal(page)
      // Select testnet
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click on BTC then click on SWAP button
      await overviewPage.SelectChain(page, assert1)
      await page.waitForSelector(`#${assert1}_swap_button`, { visible: true })
      await page.click(`#${assert1}_swap_button`)
      // Select USDC
      await swapPage.SelectSwapReceiveCoin(page)
      await page.waitForSelector('#search_for_a_currency', { visible: true })
      await page.type('#search_for_a_currency', assert2)
      await page.click(`#${assert2}`)
      await page.waitForSelector('#see_all_quotes', { visible: true })
      await swapPage.ClickOnMin(page)
      // Select Liquality Boost
      await page.waitForSelector('#see_all_quotes', { visible: true })
      await page.click('#see_all_quotes')
      await page.waitForSelector('#liqualityBoost_rate_provider', { visible: true })
      await page.click('#liqualityBoost_rate_provider')
      await page.click('#select_quote_button')
      // Check source name
      await page.waitForSelector('#selectedQuote_provider', { visible: true })
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'BTC->USDC swap, Liquality || Liquality Boost source should be chosen!')
        .oneOf(['Liquality Boost'])
    })
    it('SWAP (BTC->PUSDT (Polygon))', async () => {
      const assert1 = 'BTC'
      const assert2 = 'PUSDT'
      // overview page
      await overviewPage.HasOverviewPageLoaded(page)
      await overviewPage.CloseWatsNewModal(page)
      // Select testnet
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click on BTC then click on SWAP button
      await overviewPage.SelectChain(page, assert1)
      await page.waitForSelector(`#${assert1}_swap_button`, { visible: true })
      await page.click(`#${assert1}_swap_button`)
      // Select PUSDT
      await swapPage.SelectSwapReceiveCoin(page)
      await page.waitForSelector('#search_for_a_currency', { visible: true })
      await page.type('#search_for_a_currency', assert2)
      await page.click(`#${assert2}`)
      await swapPage.EnterSendAmountOnSwap(page, '0.0001')
      // Select Liquality Boost
      try {
        await page.waitForSelector('#see_all_quotes', { visible: true })
      } catch (e) {
        expect(e, 'No Liquidity.....').equals(null)
      }
      await page.click('#see_all_quotes')
      try {
        await page.waitForSelector('#liqualityBoost_rate_provider', { visible: true })
      } catch (e) {
        expect(e, 'No Liquidity.....').equals(null)
      }
      await page.click('#liqualityBoost_rate_provider')
      await page.click('#select_quote_button')
      // Check source name
      await page.waitForSelector('#selectedQuote_provider', { visible: true })
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'BTC->PUSDT swap, Liquality || Liquality Boost source should be chosen!')
        .oneOf(['Liquality Boost'])
    })
    it('SWAP (RBTC->PWETH (Polygon))', async () => {
      const assert1 = 'BTC'
      const assert2 = 'PWETH'
      // overview page
      await overviewPage.HasOverviewPageLoaded(page)
      await overviewPage.CloseWatsNewModal(page)
      // Select testnet
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click on BTC then click on SWAP button
      await overviewPage.SelectChain(page, assert1)
      await page.waitForSelector(`#${assert1}_swap_button`, { visible: true })
      await page.click(`#${assert1}_swap_button`)
      // Select PWETH
      await swapPage.SelectSwapReceiveCoin(page)
      await page.waitForSelector('#search_for_a_currency', { visible: true })
      await page.type('#search_for_a_currency', assert2)
      await page.click(`#${assert2}`)
      await swapPage.ClickOnMax(page)
      // Select Liquality Boost
      try {
        await page.waitForSelector('#see_all_quotes', { visible: true })
      } catch (e) {
        expect(e, 'No Liquidity.....').equals(null)
      }
      await page.click('#see_all_quotes')
      try {
        await page.waitForSelector('#liqualityBoost_rate_provider', { visible: true })
      } catch (e) {
        expect(e, 'No Liquidity.....').equals(null)
      }
      await page.click('#liqualityBoost_rate_provider')
      await page.click('#select_quote_button')
      // Check source name
      await page.waitForSelector('#selectedQuote_provider', { visible: true })
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'BTC->PWETH swap, Liquality || Liquality Boost source should be chosen!')
        .oneOf(['Liquality Boost'])
    })
  })
}
