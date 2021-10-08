const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page
const password = '123123123'

describe('Manage Accounts-[mainnet,smoke]', async () => {
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
    await overviewPage.ClickOnManageAccounts(page)
    expect(await page.$eval('#chain-item-toggle-RSK > label', el => el.getAttribute('class'))).contain('toggled')
    // Click on Plus
    await page.click('#create-account-plus-icon-rsk')
    await page.waitForSelector('#choose-account-name')
    // Cancel button
    await page.click('#cancel-button')
    await page.waitForSelector('#create-account-plus-icon-bitcoin', { visible: true })
    // Toggle off RSK and validate the number of chains from overview page
    await page.click('#chain-item-toggle-RSK')
    expect(await page.$eval('#chain-item-toggle-RSK > label', el => el.getAttribute('class'))).not.contain('toggled')
    await page.click('#previous_nav_bar')
    // overview-screen-chain-section , RSK should be hidden
    let accounts = await page.$$('.overview-screen-chain-section')
    expect(accounts.length).to.equals(8)
    // Go back to Manage account & toggle on
    await overviewPage.ClickOnManageAccounts(page)
    // Chain RSK toggle on but not accounts
    await page.click('#chain-item-toggle-RSK')
    await page.click('#previous_nav_bar')
    accounts = await page.$$('.overview-screen-chain-section')
    expect(accounts.length).to.equals(8)
  })
  it('RSK - create new account, validate accounts', async () => {
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
    let rskAccounts = await page.$$('#RSK')
    expect(rskAccounts.length).to.equals(2)

    // Click on Backup seed from Burger Icon menu
    await overviewPage.ClickOnManageAccounts(page)
    await page.waitForSelector('#create-account-plus-icon-rsk', { visible: true })
    // Click on Plus
    await page.click('#create-account-plus-icon-rsk')
    await page.waitForSelector('#choose-account-name')
    const accountName = 'automation test'
    await page.type('#choose-account-name', accountName)
    // Cancel button
    await page.click('#create-button')
    await page.waitForSelector('#create-account-plus-icon-rsk', { visible: true })
    // check new account added
    // Validate number of RSK counts
    rskAccounts = await page.$$('#account-name-id-rsk')
    expect(rskAccounts.length).to.equals(3)
  })
})
