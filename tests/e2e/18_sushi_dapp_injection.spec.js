const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const puppeteer = require('puppeteer')
const { expect } = require('chai')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page, dappPage
const password = '123123123'
const dappUrl = 'https://app.sushi.com/swap'

describe('Sushi Dapp Injection-[mainnet,testnet]', async () => {
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
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
    // Web3 toggle on
    await overviewPage.ClickWeb3WalletToggle(page)
    await page.waitForTimeout(1000)
  })
  afterEach(async () => {
    await browser.close()
  })

  it('Sushi injection - ETH["smoke"]', async () => {
    // Go to Sushi app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto(dappUrl, { timeout: 60000 })
    try {
      await dappPage.waitForSelector('#connect-wallet', { visible: true, timeout: 60000 })
      await dappPage.click('#connect-wallet')
    } catch (e) {
      await testUtil.takeScreenshot(dappPage, 'sushi-dapp-load-issue')
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Sushi dapp UI not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    // Click on Injected Option
    const injectedOption = await dappPage.$x("//*[text()='Injected']")
    injectedOption[0].click()
    // select ETH from connected
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#ETHEREUM', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'sushi-ethereum-loading-issue')
      expect(e, 'sushi ethereum loading issue').equals(null)
    }
    await connectRequestWindow.click('#ETHEREUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)
    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
  it('Sushi injection - Polygon', async () => {
    // Go to Sushi app
    dappPage = await browser.newPage()
    await dappPage.setViewport({ width: 1440, height: 700 })
    await dappPage.goto(dappUrl, { timeout: 60000 })
    try {
      await dappPage.waitForSelector('#connect-wallet', { visible: true, timeout: 60000 })
      await dappPage.click('#connect-wallet')
    } catch (e) {
      await dappPage.screenshot({ path: 'screenshots/sushi-dapp-load-issue.png', fullscreen: true })
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Sushi dapp UI not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    // Click on Injected Option
    const injectedOption = await dappPage.$x("//*[text()='Injected']")
    injectedOption[0].click()
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', { visible: true, timeout: 60000 })
      await connectRequestWindow.waitForSelector('#ARBITRUM', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'sushi-dapp-polygon-issue')
      expect(e, 'Sushi injection ARBITRUM not listed, connect request window loading issue.....').equals(null)
    }
    await connectRequestWindow.click('#POLYGON')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)
    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
})
