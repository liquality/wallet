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
const SOVRYN_AMM = 'Sovryn'

if (process.env.NODE_ENV === 'mainnet') {
  // Sovryn AMM works against RSK chain
  describe('SWAP Sovryn AMM service Provider-["MAINNET","MAINNET_RELEASE"]', async () => {
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
      await browser.close()
    })
    it('Sovryn AMM(RBTC->SOV) quote check', async () => {
      const fromAsset = 'RBTC'
      const toAsset = {
        chain: 'RSK',
        coin: 'SOV'
      }
      await overviewPage.SelectAssetFromOverview(page, fromAsset)
      await page.waitForSelector(`#${fromAsset}_swap_button`, { visible: true })
      await page.click(`#${fromAsset}_swap_button`)
      // Validate min SEND amount from text field & check Min is Active
      const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
      expect(
        swapSendAmountField,
        `${fromAsset} to ${toAsset} SWAP min value not set in input`
      ).not.equals('0.0000')
      await swapPage.ClickOnMin(page)
      // Select 2nd Pair
      await page.click('.swap-receive-main-icon')
      await page.waitForSelector(`#${toAsset.chain}`, { visible: true })
      await page.click(`#${toAsset.chain}`)
      await page.waitForSelector(`#${toAsset.coin}`, { visible: true })
      await page.click(`#${toAsset.coin}`)
      // Enter RSK amount
      // await swapPage.EnterSendAmountOnSwap(page, '0.0000001')
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
      // Validate available balance
      const { availableBalance } = await swapPage.getSwapAvailableBalance(page)
      expect(
        availableBalance,
        `${fromAsset}->${toAsset}) swap, available balance should be greater than 0`
      ).to.be.above(0)
      await page.waitForTimeout(5000)
      expect(
        await swapPage.getSelectedServiceProvider(page),
        'RBTC->SOV, Supporting source should be chosen!'
      ).oneOf([SOVRYN_AMM])
      // validate Send & To fiat values
      const { sendFromFiat, toFiat } = await swapPage.getSwapFiatValues(page)
      expect(
        sendFromFiat,
        `${fromAsset}->${toFiat}) swap, Send fiat amount should be correct!`
      ).not.equals('$0.00')
      expect(
        sendFromFiat,
        `${fromAsset}->${toFiat}) swap, To fiat amount should be correct!`
      ).not.equals('NaN')
      // validate Receive fiat amount
      expect(
        toFiat,
        `${fromAsset}->${toFiat}) swap, Receive fiat amount should be correct!`
      ).not.equals('$0.00')
      expect(
        toFiat,
        `${fromAsset}->${toFiat}) swap, Receive fiat amount should be correct!`
      ).not.equals('NaN')
    })
    it('Sovryn AMM(RBTC->RIF) quote check', async () => {
      const fromAsset = 'RBTC'
      const toAsset = {
        chain: 'RSK',
        coin: 'RIF'
      }
      await overviewPage.SelectAssetFromOverview(page, fromAsset)
      await page.waitForSelector(`#${fromAsset}_swap_button`, { visible: true })
      await page.click(`#${fromAsset}_swap_button`)
      // Validate min SEND amount from text field & check Min is Active
      const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
      expect(
        swapSendAmountField,
        `${fromAsset} to ${toAsset} SWAP min value not set in input`
      ).not.equals('0.0000')
      await swapPage.ClickOnMin(page)
      // Select 2nd Pair
      await page.click('.swap-receive-main-icon')
      await page.waitForSelector(`#${toAsset.chain}`, { visible: true })
      await page.click(`#${toAsset.chain}`)
      await page.waitForSelector(`#${toAsset.coin}`, { visible: true })
      await page.click(`#${toAsset.coin}`)
      // Enter RSK amount
      // await swapPage.EnterSendAmountOnSwap(page, '0.0000001')
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
      // Validate available balance
      const { availableBalance } = await swapPage.getSwapAvailableBalance(page)
      expect(
        availableBalance,
        `${fromAsset}->${toAsset}) swap, available balance should be greater than 0`
      ).to.be.above(0)
      await page.waitForTimeout(5000)
      expect(
        await swapPage.getSelectedServiceProvider(page),
        'RBTC->SOV, Supporting source should be chosen!'
      ).oneOf(['Sovryn'])
      // validate Send & To fiat values
      const { sendFromFiat, toFiat } = await swapPage.getSwapFiatValues(page)
      expect(
        sendFromFiat,
        `${fromAsset}->${toFiat}) swap, Send fiat amount should be correct!`
      ).not.equals('$0.00')
      expect(
        sendFromFiat,
        `${fromAsset}->${toFiat}) swap, To fiat amount should be correct!`
      ).not.equals('NaN')
      // validate Receive fiat amount
      expect(
        toFiat,
        `${fromAsset}->${toFiat}) swap, Receive fiat amount should be correct!`
      ).not.equals('$0.00')
      expect(
        toFiat,
        `${fromAsset}->${toFiat}) swap, Receive fiat amount should be correct!`
      ).not.equals('NaN')
    })
    it('Sovryn AMM(SOV->FISH) quote check', async () => {
      const fromAsset = 'SOV'
      const toAsset = {
        chain: 'RSK',
        coin: 'FISH'
      }
      await overviewPage.SelectAssetFromOverview(page, fromAsset)
      await page.waitForSelector(`#${fromAsset}_swap_button`, { visible: true })
      await page.click(`#${fromAsset}_swap_button`)
      // Select 2nd Pair (FISH)
      try {
        await page.waitForTimeout(5000)
        await page.click('#swap-receive-main-icon')
        await page.waitForSelector('#search_for_a_currency', { visible: true, timeout: 60000 })
        await page.type('#search_for_a_currency', toAsset.coin)
        await page.waitForSelector(`#${toAsset.coin}`, { visible: true })
        await page.click(`#${toAsset.coin}`)
      } catch (e) {
        if (e instanceof puppeteer.errors.TimeoutError) {
          await testUtil.takeScreenshot(page, 'click-fish-asset-swap-issue')
          expect(e, 'Select FISH assert for SWAP').equals(null)
        }
      }
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
      await page.waitForTimeout(5000)
      expect(
        await swapPage.getSelectedServiceProvider(page),
        'SOV->FISH, Supporting source should be chosen!'
      ).oneOf(['Sovryn'])
    })
  })
}
