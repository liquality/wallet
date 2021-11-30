const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const ConnectionPage = require('../Pages/ConnectionPage')
const puppeteer = require('puppeteer')
const { expect } = require('chai')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const connectionPage = new ConnectionPage()

let browser, page, dappPage
const password = '123123123'
const dappUrl = 'https://app.sushi.com/swap'

describe('Sushi Dapp Injection-[mainnet,testnet]', async () => {
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
    await connectionPage.selectAccount(await newPagePromise, 'ETHEREUM')

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

    // select POLYGON from connected
    await connectionPage.selectAccount(await newPagePromise, 'POLYGON')

    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
})
