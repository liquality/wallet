const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const expect = require('chai').expect
const chalk = require('chalk')

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page
const password = '123123123'

if (process.env.NODE_ENV === 'mainnet') {
  describe('Add Custom token only against Mainnet-["mainnet"]', async () => {
    beforeEach(async () => {
      browser = await puppeteer.launch(testUtil.getChromeOptions())
      page = await browser.newPage()
      await page.goto(testUtil.extensionRootUrl)
      await homePage.ScrollToEndOfTerms(page)
      await homePage.ClickOnAcceptPrivacy(page)
    })
    afterEach(async () => {
      try {
        console.log('Cleaning up instances')
        await page.close()
        await browser.close()
      } catch (e) {
        console.log('Cannot cleanup instances')
      }
    })
    it('Should be able to add custom token & Check token fetch details', async () => {
      const tokenDetails = {
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        name: 'Tether USD',
        symbol: 'USDT',
        decimal: '6'
      }
      // Import wallet option
      await homePage.ClickOnImportWallet(page)
      // Enter seed words and submit
      await homePage.EnterSeedWords(page, null)
      // Create a password & submit
      await passwordPage.SubmitPasswordDetails(page, password)
      // overview page
      await overviewPage.HasOverviewPageLoaded(page)
      // Select network(Only works against Mainnet)
      await overviewPage.SelectNetwork(page, 'mainnet')
      // check Send & Swap & Receive options have been displayed
      await overviewPage.ValidateSendSwipeReceiveOptions(page)

      // Click on Backup seed from Burger Icon menu
      await page.waitForSelector('#burger_icon_menu', { visible: true })
      await page.click('#burger_icon_menu')
      console.log(chalk.green('User clicked on Burger Icon Menu'))
      // Click Manage Assets
      await page.waitForSelector('#manage_assets', { visible: true })
      await page.click('#manage_assets')
      console.log(chalk.green('User clicked on Manage Assets'))
      await page.waitForSelector('#add_custom_token', { visible: true })
      await page.click('#add_custom_token')
      console.log(chalk.green('User clicked on Add Custom Token'))
      // Add Custom token screen
      await page.waitForSelector('#contractAddress', { visible: true })
      await page.type('#contractAddress', tokenDetails.address)
      console.log(chalk.green('User enter token address as'), tokenDetails.address)
      await page.waitForTimeout(2000)
      await page.click('#tokenSymbol')
      const name = await page.$eval('#name', el => el.value)
      expect(name).to.equals(tokenDetails.name)

      const symbol = await page.$eval('#tokenSymbol', el => el.value)
      expect(symbol).to.equals(tokenDetails.symbol)

      const decimal = await page.$eval('#decimals', el => el.value)
      expect(decimal).to.equals(tokenDetails.decimal)

      // TODO: validate Chain selection later
    })
  })
}
