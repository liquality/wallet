const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const AddCustomTokenPage = require('../pages/AddCustomTokenPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const addCustomTokenPage = new AddCustomTokenPage()

let browser, page
const password = '123123123'

const customTokensDetails = [
  {
    chain: 'ethereum',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    name: 'Tether USD',
    symbol: 'USDT',
    decimal: '6'
  },
  {
    chain: 'bsc',
    address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    name: 'PancakeSwap Token',
    symbol: 'Cake',
    decimal: '18'
  },
  {
    chain: 'arbitrum',
    address: '0xd4d42F0b6DEF4CE0383636770eF773390d85c61A',
    name: 'SushiToken',
    symbol: 'SUSHI',
    decimal: '18'
  },
  {
    chain: 'polygon',
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    name: 'Polygon USD Coin',
    symbol: 'USDC',
    decimal: '6'
  },
  {
    chain: 'rsk',
    address: '0x967f8799aF07DF1534d48A95a5C9FEBE92c53ae0',
    name: 'Wrapped RBTC',
    symbol: 'WRBTC',
    decimal: '18'
  }
]

describe('Custom Token add-["mainnet"]', async () => {
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
      // Network selection
      await overviewPage.SelectNetwork(page, 'mainnet')
      // Click on add custom token option
      await overviewPage.ClickAddCustomToken(page)
    })
    afterEach(async () => {
      await browser.close()
    })
    customTokensDetails.forEach((tokenDetails) => {
      it(`${tokenDetails.chain} - ${tokenDetails.symbol}-Custom token add-["smoke"]`, async () => {
        // Add Custom token screen
        await addCustomTokenPage.SelectChainDropdown(page, `${tokenDetails.chain}`)
        // paste address
        await addCustomTokenPage.EnterCustomTokenAddress(page, tokenDetails.address)
        // Validated the token details
        const fetchedTokenDetails = await addCustomTokenPage.GetTokenDetails(page)
        expect(fetchedTokenDetails.tokenName).to.equals(tokenDetails.name)
        expect(fetchedTokenDetails.tokenSymbol).to.equals(tokenDetails.symbol)
        expect(fetchedTokenDetails.tokenDecimal).to.equals(tokenDetails.decimal)
        // Check Token with this symbol exists.
        if (tokenDetails.chain === 'ethereum') {
          await addCustomTokenPage.ValidateTokenAlreadyAdded(page)
        }
      })
    })
    it('ETHEREUM - PolkaRare Token Add', async () => {
      const tokenDetails = {
        chain: 'ethereum',
        address: '0x2c2f7e7c5604d162d75641256b80f1bf6f4dc796',
        name: 'PolkaRareToken',
        symbol: 'PRARE',
        decimal: '18'
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
      // Click on Add Token button
      await addCustomTokenPage.AddTokenButton(page)

      // Click on Backup Burger Icon menu
      await page.waitForSelector('#burger_icon_menu', { visible: true })
      await page.click('#burger_icon_menu')
      console.log(('User clicked on Burger Icon Menu'))
      // Click Manage Assets
      await page.waitForSelector('#manage_assets', { visible: true })
      await page.click('#manage_assets')
      console.log(('User clicked on Manage Assets'))

      // Search with token symbol and the token should be enabled with toggled switch
      await page.type('#search_for_an_assert_input', tokenDetails.symbol)
      await page.waitForSelector(`#${tokenDetails.symbol}`, { visible: true })
      expect(await page.$eval(`#${tokenDetails.symbol}_toggle_button > label`, el => el.getAttribute('class')),
        'Added custom token toggled automatically')
        .contains('vue-js-switch toggled')
    })
    it('BSC - PancakeSwap token add, remove custom token after', async () => { // Import wallet option
      const tokenDetails = {
        chain: 'bsc',
        address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
        name: 'PancakeSwap Token',
        symbol: 'Cake',
        decimal: '18'
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
      // Click on Add Token button
      await addCustomTokenPage.AddTokenButton(page)

      // Click on mange assets
      await overviewPage.ClickManageAssets(page)

      // Search with token symbol and the token should be enabled with toggled switch
      await page.type('#search_for_an_assert_input', tokenDetails.symbol)
      await page.waitForSelector(`#${tokenDetails.symbol}`, { visible: true })
      expect(await page.$eval(`#${tokenDetails.symbol}_toggle_button > label`, el => el.getAttribute('class')),
        'Added custom token toggled automatically')
        .contains('vue-js-switch toggled')
      // Remove token
      await addCustomTokenPage.RemoveCustomToken(page, tokenDetails.symbol)
    })
  }
})
