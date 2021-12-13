const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const AddCustomTokenPage = require('../../pages/AddCustomTokenPage')

const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const addCustomTokenPage = new AddCustomTokenPage()

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
      // Select network(Only works against Mainnet)
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click on add custom token option
      await overviewPage.ClickAddCustomToken(page)
    })
    afterEach(async () => {
      await browser.close()
    })
    it('Terra Mirror custom token add', async () => {
      const tokenDetails = {
        chain: 'terra',
        address: 'terra15gwkyepfc6xgca5t5zefzwy42uts8l2m4g40k6',
        name: 'Mirror',
        symbol: 'MIR',
        decimal: '6'
      }
      // Add Custom token screen
      await addCustomTokenPage.SelectChainDropdown(page, `${tokenDetails.chain}`)
      // paste address
      await addCustomTokenPage.EnterCustomTokenAddress(page, tokenDetails.address)
      // Validated the token details
      const fetchedTokenDetails = await addCustomTokenPage.GetTokenDetails(page)
      expect(fetchedTokenDetails.tokenName).to.equals(tokenDetails.name)
      expect(fetchedTokenDetails.tokenSymbol).to.equals(tokenDetails.symbol)
      expect(fetchedTokenDetails.tokenDecimal).to.equals(tokenDetails.decimal)
      // Add token button is disabled
      await addCustomTokenPage.DisabledAddTokenButton(page)
    })
  }
})
