const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page
const password = '123123123'

if (process.env.NODE_ENV === 'mainnet') {
  describe('Remove custom token ["mainnet"]', async () => {
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
    it('ETHEREUM - PolkaRare Token Remove', async () => {
      const tokenDetails = {
        chain: 'ethereum',
        address: '0x2c2f7e7c5604d162d75641256b80f1bf6f4dc796',
        name: 'PolkaRareToken',
        symbol: 'PRARE',
        decimal: '18'
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

      // Click on Add Token button
      await page.click('#add_token_button')

      // Click on Backup Burger Icon menu
      await page.waitForSelector('#burger_icon_menu', { visible: true })
      await page.click('#burger_icon_menu')
      console.log(('User clicked on Burger Icon Menu'))
      // Click Manage Assets
      await page.waitForSelector('#manage_assets', { visible: true })
      await page.click('#manage_assets')
      console.log(('User clicked on Manage Assets'))

      // Remove token
      await page.waitForSelector('#' + tokenDetails.symbol + '_remove_custom_token', { visible: true })
      await page.click('#' + tokenDetails.symbol + '_remove_custom_token')
      await page.type('#search_for_an_assert_input', tokenDetails.symbol)
      await page.waitForSelector('.manage-assets_customText', { visible: true })
      console.log(('Remove token clicked!'))
    })

    it('BSC - PancakeSwap token remove', async () => { // Import wallet option
      // Select network(Only works against Mainnet)
      await overviewPage.SelectNetwork(page, 'mainnet')
      // check Send & Swap & Receive options have been displayed
      await overviewPage.ValidateSendSwipeReceiveOptions(page)

      const tokenDetails = {
        chain: 'bsc',
        address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
        name: 'PancakeSwap Token',
        symbol: 'Cake',
        decimal: '18'
      }
      // Click on Backup seed from Burger Icon menu
      await page.waitForSelector('#burger_icon_menu', { visible: true })
      await page.click('#burger_icon_menu')
      console.log(('User clicked on Burger Icon Menu'))
      // Click Manage Assets
      await page.waitForSelector('#manage_assets', { visible: true })
      await page.click('#manage_assets')
      console.log(('User clicked on Manage Assets'))
      // click on add custom token
      await page.waitForSelector('#add_custom_token', { visible: true })
      await page.click('#add_custom_token')
      console.log(('User clicked on Add Custom Token'))

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

      // Click on Add Token button
      await page.click('#add_token_button')

      // Click on Backup Burger Icon menu
      await page.waitForSelector('#burger_icon_menu', { visible: true })
      await page.click('#burger_icon_menu')
      console.log(('User clicked on Burger Icon Menu'))
      // Click Manage Assets
      await page.waitForSelector('#manage_assets', { visible: true })
      await page.click('#manage_assets')
      console.log(('User clicked on Manage Assets'))

      // Remove token
      await page.waitForSelector('#' + tokenDetails.symbol + '_remove_custom_token', { visible: true })
      await page.click('#' + tokenDetails.symbol + '_remove_custom_token')
      await page.type('#search_for_an_assert_input', tokenDetails.symbol)
      await page.waitForSelector('.manage-assets_customText', { visible: true })
      console.log(('Remove token clicked!'))
    })
  })
}
