const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page
const password = '123123123'

describe('Terra Custom token-["mainnet"]', async () => {
  if (process.env.NODE_ENV === 'mainnet') {
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
      if (page != null) {
        await page.close()
      }
    })
    it('Terra Mirror custom token add', async () => {
      const tokenDetails = {
        chain: 'terra',
        address: 'terra15gwkyepfc6xgca5t5zefzwy42uts8l2m4g40k6',
        name: 'Mirror',
        symbol: 'MIR',
        decimal: '6'
      }
      // Select network(Only works against Mainnet)
      await overviewPage.SelectNetwork(page, 'mainnet')
      // check Send & Swap & Receive options have been displayed
      await overviewPage.ValidateSendSwipeReceiveOptions(page)

      // Click on add custom token option
      await overviewPage.ClickAddCustomToken(page)
      // Add Custom token screen
      await page.waitForSelector('#contractAddress', { visible: true })
      // select chain
      await page.waitForSelector('#select_chain_dropdown', { visible: true })
      await page.click('#select_chain_dropdown')
      await page.waitForSelector(`#${tokenDetails.chain}_chain`, { visible: true })
      await page.click(`#${tokenDetails.chain}_chain`)
      // paste address
      await page.type('#contractAddress', tokenDetails.address)
      console.log(('User enter token address as'), tokenDetails.address)
      await page.click('#tokenSymbol')
      await page.click('#name')
      await page.waitForTimeout(10000)
      // Check Token name
      const name = await page.$eval('#name', el => el.value)
      expect(name).to.equals(tokenDetails.name)
      // Check Token Symbol
      const symbol = await page.$eval('#tokenSymbol', el => el.value)
      expect(symbol).to.equals(tokenDetails.symbol)
      // Check Token Symbol
      const decimal = await page.$eval('#decimals', el => el.value)
      expect(decimal).to.equals(tokenDetails.decimal)
      // Add token button is disabled
      const addTokenDetails = await page.$eval('#add_token_button', el => el.getAttribute('disabled'))
      expect(addTokenDetails).to.eq('disabled')
    })
  }
})
