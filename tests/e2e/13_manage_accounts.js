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

describe('Manage Accounts ["smoke"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
  })
  afterEach(async () => {
    try {
      await page.close()
      await browser.close()
    } catch (e) {
      throw new Error(e)
    }
  })
  it('RSK - toggle on/off validate accounts', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page, null)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.CloseWatsNewModal(page)
    await overviewPage.SelectNetwork(page)
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // Validate RSK accounts on overview page first time
    const rskAccounts = await page.$$('#RSK')
    expect(rskAccounts.length).to.equals(2)

    // Click on Backup seed from Burger Icon menu
    await page.waitForSelector('#burger_icon_menu', { visible: true })
    await page.click('#burger_icon_menu')
    console.log(chalk.green('User clicked on Burger Icon Menu'))
    // Click Manage Accounts
    await page.waitForSelector('#manage_accounts', { visible: true })
    await page.click('#manage_accounts')
    console.log(chalk.green('User clicked on Manage Accounts'))
    await page.waitForSelector('#create-account-plus-icon-bitcoin', { visible: true })
  })
})
