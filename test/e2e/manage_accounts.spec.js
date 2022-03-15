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

let browser, page, dappPage
const password = '123123123'
const dappUrl = 'https://app.uniswap.org'

// Manage accounts experimental feature
describe('Manage Accounts-["MAINNET","PULL_REQUEST_TEST"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    // Configure the navigation timeout
    await page.setDefaultNavigationTimeout(0)
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'networkidle2' })
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

    await overviewPage.SelectNetwork(page, 'mainnet')
  })
  afterEach(async () => {
    await browser.close()
  })
  it('RSK - toggle on/off validate accounts', async () => {
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // Validate RSK accounts on overview page first time
    const rskAccounts = await page.$$('#RSK')
    expect(rskAccounts.length).to.equals(2)

    // Click on Manage accounts option
    await overviewPage.ToggleExperimentButton(page, 'exp-manageAccounts-toggle-switch')
    await overviewPage.ClickOnManageAccounts(page)
    expect(
      await page.$eval('#chain-item-toggle-rsk > label', (el) => el.getAttribute('class'))
    ).contain('toggled')
    // Click on Plus
    await page.click('#create-account-plus-icon-rsk')
    await page.waitForSelector('#choose-account-name')
    // Cancel button
    await page.click('#cancel-button')
    await page.waitForSelector('#create-account-plus-icon-bitcoin', { visible: true })
    // Toggle off RSK and validate the number of chains from overview page
    await page.click('#chain-item-toggle-rsk')
    expect(
      await page.$eval('#chain-item-toggle-rsk > label', (el) => el.getAttribute('class'))
    ).not.contain('toggled')
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
    expect(accounts.length).to.equals(10)
  })
  it('RSK - create new account, validate RSK 3 accounts', async () => {
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // Validate RSK accounts on overview page first time
    let rskAccounts = await page.$$('#RSK')
    expect(rskAccounts.length).to.equals(2)

    // Select Manage accounts options
    await overviewPage.ToggleExperimentButton(page, 'exp-manageAccounts-toggle-switch')
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
    rskAccounts = await page.$$('#account-item-rsk')
    expect(rskAccounts.length).to.equals(3)
  })
  it('ETH - create new account, validate accounts, uniswap dapp injection', async () => {
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // Validate ETH accounts on overview page first time
    let ethAccounts = await page.$$('#ETH')
    expect(ethAccounts.length).to.equals(1)

    // Select manage accounts option under settings
    await overviewPage.ToggleExperimentButton(page, 'exp-manageAccounts-toggle-switch')
    await overviewPage.ClickOnManageAccounts(page)
    await page.waitForSelector('#create-account-plus-icon-ethereum', { visible: true })
    // Click on Plus
    await page.click('#create-account-plus-icon-ethereum')
    await page.waitForSelector('#choose-account-name')
    const accountName = 'automation test'
    await page.type('#choose-account-name', accountName)
    await page.waitForTimeout(2000)
    // Click button
    await page.click('#create-account-button')
    await page.waitForSelector('#create-account-plus-icon-ethereum', { visible: true })
    // check new account added
    // Validate number of ETH counts
    ethAccounts = await page.$$('#account-item-ethereum')
    expect(ethAccounts.length).to.equals(2)
    // Default web3 option toggled on
    await overviewPage.CheckWeb3ToggleOn(page)
    // Connected dapp option
    await page.click('#connect_dapp_main_option')
    await page.waitForSelector('.v-switch-core', { visible: true })

    // Go to uniSwap app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto(dappUrl, { waitUntil: 'networkidle0', timeout: 90000 })
    try {
      await dappPage.waitForSelector('#swap-nav-link', { visible: true, timeout: 60000 })
      await dappPage.waitForSelector('#connect-wallet', { visible: true })
    } catch (e) {
      await testUtil.takeScreenshot(dappPage, 'uniswap-dapp-loading-issue')
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Uniswap dapp UI not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    await dappPage.click('#connect-wallet')
    await dappPage.waitForSelector('#connect-INJECTED', { visible: true })
    // Before click on injected wallet option.
    const newPagePromise = new Promise((x) =>
      browser.once('targetcreated', (target) => x(target.page()))
    ) /* eslint-disable-line */
    await dappPage.click('#connect-INJECTED')
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', {
        visible: true,
        timeout: 120000
      })
      await connectRequestWindow.waitForSelector('#ETHEREUM', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(
        connectRequestWindow,
        'uniswap-ethereum-connect-request-window-issue'
      )
      expect(e, 'Uniswap injection ethereum not listed, connected window not loaded.....').equals(
        null
      )
    }
    //Filter by chain
    await connectRequestWindow.waitForSelector('#filter_by_chain', {
      visible: true,
      timeout: 60000
    })
    // Check connect button is enabled
    ethAccounts = await connectRequestWindow.$$('#ETHEREUM')
    expect(
      ethAccounts.length,
      'ethAccounts should have length 2 on dapp connect request'
    ).to.equals(2)
    await connectRequestWindow.click('#ETHEREUM')
    // click Next button
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', {
      visible: false,
      timeout: 60000
    })
    // check origin url
    await connectRequestWindow
      .$eval('#origin_url', (el) => el.innerText)
      .then((text) => expect(text).to.equals(dappUrl))
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
})
