const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const puppeteer = require('puppeteer')
const { expect } = require('chai')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page, dappPage
const password = '123123123'
const dappUrl = 'https://app.uniswap.org/#/swap'

describe('Uniswap Dapp Injection-[mainnet,smoke]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 60000 })
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)

    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.CloseWatsNewModal(page)
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
    // Click on Backup seed from Burger Icon menu
    await overviewPage.ClickOnBurgerIcon(page)
    // Click on Settings
    await overviewPage.SelectSettings(page)
    // toggle web3 wallet option
    await page.click('#default_web3_wallet_toggle_button > label > div')
    await page.waitForTimeout(1000)
  })
  afterEach(async () => {
    await browser.close()
  })

  it('UNISWAP Injection-ETH', async () => {
    // Go to uniSwap app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto(dappUrl, { timeout: 60000 })
    try {
      await dappPage.waitForSelector('#swap-nav-link', { visible: true, timeout: 60000 })
      await dappPage.waitForSelector('#connect-wallet', { visible: true })
    } catch (e) {
      await testUtil.takeScreenshot(dappPage, 'uniswap-arbitrum-loading-issue')
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Uniswap dapp UI not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    await dappPage.click('#connect-wallet')
    await dappPage.waitForSelector('#connect-INJECTED', { visible: true })
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.click('#connect-INJECTED')
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', { visible: true, timeout: 60000 })
      await connectRequestWindow.click('#ETHEREUM')
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'uniswap-ethereum-connect-request-window-issue')
      expect(e, 'Uniswap injection ethereum not listed.....').equals(null)
    }
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)
    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
  it('UNISWAP Injection-ARBITRUM', async () => {
    // Go to uniSwap app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto(dappUrl, { timeout: 60000 })
    try {
      await dappPage.waitForSelector('#swap-nav-link', { visible: true, timeout: 60000 })
      await dappPage.waitForSelector('#connect-wallet', { visible: true })
    } catch (e) {
      await testUtil.takeScreenshot(dappPage, 'uniswap-arbitrum-loading-issue')
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Uniswap dapp UI not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    await dappPage.click('#connect-wallet')
    await dappPage.waitForSelector('#connect-INJECTED', { visible: true })
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.click('#connect-INJECTED')
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', { visible: true, timeout: 60000 })
      await connectRequestWindow.click('#ARBITRUM')
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'uniswap-arbitrum-connect-request-window-issue')
      expect(e, 'Uniswap injection arbitrum not listed.....').equals(null)
    }

    await connectRequestWindow.waitForSelector('#ARBITRUM', { visible: true })
    await connectRequestWindow.click('#ARBITRUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
})
