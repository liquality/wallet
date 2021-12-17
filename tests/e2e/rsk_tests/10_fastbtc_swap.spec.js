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

// https://wiki.sovryn.app/en/sovryn-dapp/fast_btc
if (process.env.NODE_ENV === 'mainnet') {
  // fastBTC service provider only in mainnet(dev & prod)
  describe('FastBTC swap provider-["mainnet","smoke"]', async () => {
    before(async () => {
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
    after(async () => {
      await page.close()
      await browser.close()
    })

    it('SWAP BTC to RBTC - fastBTC', async () => {
      const fromAsset = 'BTC'
      // Select mainnet for fastBTC e2e
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click asset 1
      await overviewPage.SelectAssetFromOverview(page, fromAsset)
      await page.waitForSelector('#' + fromAsset + '_swap_button', { visible: true })
      await page.click('#' + fromAsset + '_swap_button')
      console.log(('User clicked on BTC SWAP button'))

      await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
      console.log('SWAP screen has been displayed with send amount input field')

      // Select 2nd Pair (RBTC)
      await page.click('.swap-receive-main-icon')
      await page.waitForSelector('#RSK', { visible: true })
      await page.click('#RSK')
      await page.waitForSelector('#RBTC', { visible: true })
      await page.click('#RBTC')
      console.log('User selected RBTC as 2nd pair for swap')

      try {
        await page.waitForSelector('#selectedQuote_provider', {
          visible: true,
          timeout: 60000
        })
      } catch (e) {
        await testUtil.takeScreenshot(page, 'fastbtc-swap-issue')
        expect(e, 'fastbtc swp between BTC->RBTC failed, may be No Liquidity.....').equals(null)
      }

      // Update the SWAP value to 0.0004
      let swapAmount = '0.0004'
      if (process.env.NODE_AGENT === 'prodagent') {
        swapAmount = '0.01'
      }
      await swapPage.EnterSendAmountOnSwap(page, swapAmount)
      // (fastBTC swap provider)
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
      await page.waitForTimeout(5000)
      const quoteProvider = await page.$eval('#selectedQuote_provider', (el) => el.textContent)
      if (quoteProvider === 'FastBTC') {
        expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
          'BTC->RBTC,fastBTC swap Provider!!').oneOf(['FastBTC'])
      } else {
        try {
          await page.waitForSelector('#see_all_quotes', {
            visible: true,
            timeout: 60000
          })
          await page.click('#see_all_quotes')
          await page.waitForSelector('#fastBTC_rate_provider')
          await page.click('#fastBTC_rate_provider')
          await page.click('#select_quote_button')
        } catch (e) {
          await testUtil.takeScreenshot(page, 'fastbtc-see-all-quotes')
          expect(e, 'fastbtc swp between BTC->RBTC failed, sell all quotes not displayed.....').equals(null)
        }

        expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
          'BTC->RBTC,fastBTC swap Provider!!').oneOf(['FastBTC'])
      }
    })
  })
}
