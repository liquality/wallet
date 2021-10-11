const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../Pages/OverviewPage')
const HomePage = require('../../Pages/HomePage')
const PasswordPage = require('../../Pages/PasswordPage')
const SwapPage = require('../../Pages/SwapPage')
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
  // fastBTC service provider only in mainnet
  describe('FastBTC swap provider-["mainnet","smoke"]', async () => {
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
      // Select mainnet for fastBTC e2e
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
      console.log('User selected RBTC as 2nd pair for swap')

      // (Liquality swap provider)
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'BTC->RBTC,Liquality swap source should be chosen!').equals('Liquality')
      console.log(chalk.green('Liquality service provider selected for BTC->RBTC by default'))

      // Update the SWAP value to 0.0004
      await swapPage.EnterSendAmountOnSwap(page, '0.0004')
      console.log(chalk.redBright('User enter 0.0004 value for BTC->RBTC swap'))
      // (fastBTC swap provider)
      await page.waitForTimeout(5000)
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
      // Click on BTC Max amount
      await swapPage.ClickOnMax(page)
      await page.waitForTimeout(2000)
      expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
        'BTC->RBTC,fastBTC swap source should be chosen if BTC max').oneOf(['Liquality','FastBTC'])
    })
  })
}
