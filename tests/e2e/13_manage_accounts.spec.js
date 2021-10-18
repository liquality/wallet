const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')
const chalk = require('chalk')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page
const password = '123123123'

// TODO: once multi account enable lets start the test
describe.skip('Manage Accounts-[mainnet,smoke]', async () => {
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
    expect(await page.$eval('#chain-item-toggle-rsk > label', el => el.getAttribute('class'))).contain('toggled')
    // Click on Plus
    await page.click('#create-account-plus-icon-rsk')
    await page.waitForSelector('#choose-account-name')
    // Cancel button
    await page.click('#cancel-button')
    await page.waitForSelector('#create-account-plus-icon-bitcoin', { visible: true })
    // Toggle off RSK and validate the number of chains from overview page
    await page.click('#chain-item-toggle-rsk')
    expect(await page.$eval('#chain-item-toggle-rsk > label', el => el.getAttribute('class'))).not.contain('toggled')
    await page.click('#previous_nav_bar')
    // overview-screen-chain-section , RSK should be hidden
    let accounts = await page.$$('.overview-screen-chain-section')
    expect(accounts.length).to.equals(8)
    // Go back to Manage account & toggle on
    await overviewPage.ClickOnManageAccounts(page)
    // Chain RSK toggle on but not accounts
    await page.click('#chain-item-toggle-rsk')
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
    await overviewPage.SelectNetwork(page, 'mainnet')
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // Validate RSK accounts on overview page first time
    let rskAccounts = await page.$$('#RSK')
    expect(rskAccounts.length).to.equals(2)

    // Click on Backup seed from Burger Icon menu
    await overviewPage.ClickOnManageAccounts(page)
    await page.waitForSelector('#create-account-plus-icon-rsk', { visible: true, timeout: 60000 })
    // Click on Plus
    await page.click('#create-account-plus-icon-rsk')
    await page.waitForSelector('#choose-account-name')
    const accountName = 'automation test'
    await page.type('#choose-account-name', accountName)
    // Cancel button
    await page.waitForTimeout(5000)
    await page.click('#create-account-button')
    await page.waitForSelector('#create-account-plus-icon-rsk', { visible: true, timeout: 60000 })
    // check new account added
    // Validate number of RSK counts
    rskAccounts = await page.$$('.account-item-rsk')
    expect(rskAccounts.length).to.equals(3)
  })
  it.skip('ETH - create new account, validate accounts, uniswap dapp injection', async () => {
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
    // Validate ETH accounts on overview page first time
    let ethAccounts = await page.$$('#ETH')
    expect(ethAccounts.length).to.equals(1)

    // Click on Backup seed from Burger Icon menu
    await overviewPage.ClickOnManageAccounts(page)
    await page.waitForSelector('#create-account-plus-icon-ethereum', { visible: true })
    // Click on Plus
    await page.click('#create-account-plus-icon-ethereum')
    await page.waitForSelector('#choose-account-name')
    const accountName = 'automation test'
    await page.type('#choose-account-name', accountName)
    await page.waitForTimeout(5000)
    // Cancel button
    await page.click('#create-account-button')
    await page.waitForSelector('#create-account-plus-icon-ethereum', { visible: true })
    // check new account added
    // Validate number of ETH counts
    ethAccounts = await page.$$('#account-item-ethereum')
    expect(ethAccounts.length).to.equals(2)
    // Click on Backup seed from Burger Icon menu
    await overviewPage.ClickOnBurgerIcon(page)
    // Click on Settings
    await overviewPage.SelectSettings(page)
    // toggle web3 wallet option
    await page.click('#default_web3_wallet_toggle_button > label > div')
    // Go to uniSwap app
    const dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto('https://app.uniswap.org/#/swap')
    try {
      await dappPage.waitForSelector('#swap-nav-link', { visible: true, timeout: 60000 })
      await dappPage.waitForSelector('#connect-wallet', { visible: true })
    } catch (e) {
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      console.log(chalk.red(pageTitle))
      console.log(chalk.red(pageUrl))
      expect(e, 'Uniswap dapp UI not loading.....').equals(null)
    }
    await dappPage.click('#connect-wallet')
    await dappPage.waitForSelector('#connect-INJECTED', { visible: true })

    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.click('#connect-INJECTED')
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#ETHEREUM', { visible: true })
    ethAccounts = await connectRequestWindow.$$('#ETHEREUM')
    expect(ethAccounts.length).to.equals(2)
    await connectRequestWindow.click('#ETHEREUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
})
