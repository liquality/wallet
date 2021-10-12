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
const uniswapDappUrl = 'https://app.uniswap.org/#/swap'

describe('Dapp Injection-[mainnet,dappTest]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
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
    await page.close()
    await dappPage.close()
    await browser.close()
  })

  it('UNISWAP Injection-ETH', async () => {
    // Go to uniSwap app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto(uniswapDappUrl, { timeout: 60000 })
    try {
      await dappPage.waitForSelector('#swap-nav-link', { visible: true, timeout: 60000 })
      await dappPage.waitForSelector('#connect-wallet', { visible: true })
      await dappPage.screenshot({ path: 'screenshots/uniswap-eth-true.png', fullscreen: true })
    } catch (e) {
      await dappPage.screenshot({ path: 'screenshots/uniswap-eth-false.png', fullscreen: true })
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Uniswap dapp UI not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    await dappPage.click('#connect-wallet')
    await dappPage.waitForSelector('#connect-INJECTED', { visible: true })
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.click('#connect-INJECTED')
    // await dappPage.evaluate(
    //   () => {
    //     window.ethereum.enable()
    //   })
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#ETHEREUM', { visible: true })
    await connectRequestWindow.click('#ETHEREUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
  it('UNISWAP Injection-ARBITRUM', async () => {
    // Select polygon network
    await page.click('#dropdown-item')
    await page.waitForSelector('#arbitrum_web_network', { visible: true })
    await page.click('#arbitrum_web_network')

    // Go to uniSwap app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto(uniswapDappUrl, { timeout: 60000 })
    try {
      await dappPage.waitForSelector('#swap-nav-link', { visible: true, timeout: 60000 })
      await dappPage.waitForSelector('#connect-wallet', { visible: true })
      await dappPage.screenshot({ path: 'screenshots/uniswap-arbitrum-true.png', fullscreen: true })
    } catch (e) {
      await dappPage.screenshot({ path: 'screenshots/uniswap-arbitrum-false.png', fullscreen: true })
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
    await connectRequestWindow.waitForSelector('#ARBITRUM', { visible: true })
    await connectRequestWindow.click('#ARBITRUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
  it('Sushi injection - ETH', async () => {
    // Go to Sushi app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto('https://app.sushi.com/swap')
    await dappPage.waitForSelector('#connect-wallet', { visible: true })
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.evaluate(
      () => {
        window.ethereum.enable()
      })

    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#ETHEREUM', { visible: true })
    await connectRequestWindow.click('#ETHEREUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    await dappPage.reload()
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
  it('Sushi injection - Polygon', async () => {
    // Select polygon network
    await page.click('#dropdown-item')
    await page.waitForSelector('#polygon_web_network', { visible: true })
    await page.click('#polygon_web_network')

    // Go to Sushi app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto('https://app.sushi.com/swap')
    await dappPage.waitForSelector('#connect-wallet', { visible: true })
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.evaluate(
      () => {
        window.polygon.enable()
      })
    // await walletConnect[0].click()
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#POLYGON', { visible: true })
    await connectRequestWindow.click('#POLYGON')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    await dappPage.reload()
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
  it.skip('1Inch injection - ETH', async () => {
    // Go to 1inch app
    const dappPage = await browser.newPage()
    await dappPage.goto('https://app.1inch.io/')
    await dappPage.waitForSelector('[data-id$="header.connect-wallet-button"]', { visible: true })
    await dappPage.click('[data-id$="header.connect-wallet-button"]')
    await dappPage.waitForSelector("[data-id$='Ethereum']")
    await dappPage.click('.mat-checkbox-inner-container')
    await dappPage.click("[data-id$='Ethereum']")

    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.click("[data-id$='Web3']")
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#ETHEREUM', { visible: true })
    await connectRequestWindow.click('#ETHEREUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    await dappPage.waitForSelector("[class$='account-button ng-star-inserted']", { visible: true })
  })
  it.skip('1Inch injection - Polygon', async () => {
    // Select polygon network
    await page.click('#dropdown-item')
    await page.waitForSelector('#polygon_web_network', { visible: true })
    await page.click('#polygon_web_network')

    // Go to 1inch app
    const dappPage = await browser.newPage()
    await dappPage.goto('https://app.1inch.io/')
    // Change to polygon
    await dappPage.waitForSelector('[data-id*="connect-wallet-button"]', { visible: true })
    await dappPage.click("[data-id$='header.switch-network-button']")
    await dappPage.click("[data-id$='Polygon Network']")
    await dappPage.waitForTimeout(2000)

    await dappPage.click('[data-id*="connect-wallet-button"]')
    await dappPage.waitForSelector("[data-id$='Ethereum']")
    await dappPage.click('.mat-checkbox-inner-container')
    await dappPage.click("[data-id$='Polygon Network']")

    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.click("[data-id$='Web3']")
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#POLYGON', { visible: true })
    await connectRequestWindow.click('#POLYGON')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    await dappPage.waitForSelector("[class$='account-button ng-star-inserted']", { visible: true })
  })
  it.skip('1Inch injection - BSC', async () => {
    // Select polygon network
    await page.click('#dropdown-item')
    await page.waitForSelector('#bsc_web_network', { visible: true })
    await page.click('#bsc_web_network')

    // Go to 1inch app
    const dappPage = await browser.newPage()
    await dappPage.goto('https://app.1inch.io/')
    // Change to BSC
    await dappPage.waitForSelector('[data-id*="connect-wallet-button"]', { visible: true })
    await dappPage.click("[data-id$='header.switch-network-button']")
    await dappPage.click("[data-id$='BSC Mainnet']")
    await dappPage.waitForTimeout(2000)

    await dappPage.click('[data-id*="connect-wallet-button"]')
    await dappPage.waitForSelector("[data-id$='Ethereum']")
    await dappPage.click('.mat-checkbox-inner-container')
    await dappPage.waitForSelector("[data-id*='BSC']", { visible: true })
    await dappPage.click("[data-id*='BSC']")

    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.click("[data-id$='Web3']")
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#BSC', { visible: true })
    await connectRequestWindow.click('#BSC')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    await dappPage.waitForSelector("[class$='account-button ng-star-inserted']", { visible: true })
  })
})
