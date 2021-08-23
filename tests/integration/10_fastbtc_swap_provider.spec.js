const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const SwapPage = require('../Pages/SwapPage')
const expect = require('chai').expect
const chalk = require('chalk')

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()

let browser, page
const password = '123123123'

if (process.env.NODE_ENV === 'mainnet') {
  describe('FastBTC swap provider-only on ["mainnet","smoke"]', async () => {
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
      await page.close()
      await browser.close()
    })

    it('SWAP BTC to RBTC - fastBTC', async () => {
      const asset1 = 'BTC'

      // overview page
      await overviewPage.HasOverviewPageLoaded(page)
      await overviewPage.CloseWatsNewModal(page)
      // Select mainnet for fastBTC integration
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click asset 1
      await overviewPage.SelectChain(page, asset1)
      await page.waitForSelector('#' + asset1 + '_swap_button', { visible: true })
      await page.click('#' + asset1 + '_swap_button')
      console.log(chalk.green('User clicked on BTC SWAP button'))

      await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
      console.log('SWAP screen has been displayed with send amount input field')

      // Select 2nd Pair (RBTC)
      await page.click('.swap-receive-main-icon')
      await page.waitForSelector('#RSK', { visible: true })
      await page.click('#RSK')
      await page.waitForSelector('#RBTC', { visible: true })
      await page.click('#RBTC')

      // (Liquality swap provider)
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'BTC->RBTC,Liquality swap source should be chosen!').equals('Liquality')

      // Update the SWAP value to 1
      await swapPage.EnterSendAmountOnSwap(page, '1')

      // (fastBTC swap provider)
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'BTC->RBTC,fastBTC swap source should be chosen if BTC=1').oneOf(['FastBTC', 'Liquality'])
    })
    it('SWAP BTC to RBTC - fastBTC quote select', async () => {
      const asset1 = 'BTC'

      // overview page
      await overviewPage.HasOverviewPageLoaded(page)
      await overviewPage.CloseWatsNewModal(page)
      // Select MainBet for fastBTC integration
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click asset 1
      await overviewPage.SelectChain(page, asset1)
      await page.waitForSelector('#' + asset1 + '_swap_button', { visible: true })
      await page.click('#' + asset1 + '_swap_button')
      console.log(chalk.green('User clicked on BTC SWAP button'))

      await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
      console.log('SWAP screen has been displayed with send amount input field')

      // Select 2nd Pair (RBTC)
      await page.click('.swap-receive-main-icon')
      await page.waitForSelector('#RSK', { visible: true })
      await page.click('#RSK')
      await page.waitForSelector('#RBTC', { visible: true })
      await page.click('#RBTC')

      // (Liquality swap provider)
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'BTC->RBTC,Liquality swap source should be chosen!').equals('Liquality')

      // Check see all quotes
      await page.waitForSelector('#see_all_quotes', { visible: true })
      await page.click('#see_all_quotes')
      await page.waitForSelector('#available_quotes_header', { visible: true })
      await page.click('#fastBTC_rate_provider')
      await page.click('#select_quote_button')

      // (fastBTC swap provider)
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })

      // (FastBTC)
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'BTC->RBTC,fastBTC swap source should be chosen if BTC=1').oneOf(['FastBTC'])
    })
  })
}
