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
const dappUrl = 'https://app.uniswap.org/#/swap'
let ethereumChainId, arbitrumChainId

describe('Uniswap Dapp Injection-[mainnet,testnet,smoke]', async () => {
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
      ethereumChainId = 1
      arbitrumChainId = 42161
    } else {
      await overviewPage.SelectNetwork(page)
      ethereumChainId = 3
      arbitrumChainId = 421611
    }
    // Web3 toggle on
    await overviewPage.ClickWeb3WalletToggle(page)
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
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.evaluate(async () => {
      window.ethereum.enable()
    })
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', { visible: true, timeout: 120000 })
      await connectRequestWindow.waitForSelector('#ARBITRUM', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'uniswap-ethereum-connect-request-window-issue')
      expect(e, 'Uniswap injection ethereum not listed, connected window not loaded.....').equals(null)
    }
    await connectRequestWindow.click('#ETHEREUM')
    await connectRequestWindow.click('#connect_request_button').catch(e => e)
    // Check web3 status as connected
    const connectedChainDetails = await dappPage.evaluate(async () => {
      const chainIDHexadecimal = await window.ethereum.request({ method: 'eth_chainId', params: [] })
      return {
        chainId: parseInt(chainIDHexadecimal, 16),
        connectedAddress: await window.ethereum.request({ method: 'eth_accounts' })
      }
    })
    expect(connectedChainDetails.chainId, 'Uniswap ethereum dapp connection issue').equals(ethereumChainId)
    expect(connectedChainDetails.connectedAddress[0], 'Uniswap ethereum dapp connection issue')
      .equals('0x3f429e2212718a717bd7f9e83ca47dab7956447b')
  })
  it('UNISWAP Injection-ARBITRUM', async () => {
    // Select ARBITRUM
    await page.click('#dropdown-item')
    await page.waitForSelector('#arbitrum_web_network', { visible: true })
    await page.click('#arbitrum_web_network')

    // Go to uniSwap app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto(dappUrl, { timeout: 60000 })
    try {
      await dappPage.waitForSelector('#swap-nav-link', { visible: true, timeout: 60000 })
      await dappPage.waitForSelector('#connect-wallet', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(dappPage, 'uniswap-arbitrum-loading-issue')
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Uniswap dapp UI not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.evaluate(async () => {
      window.ethereum.enable()
    })
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', { visible: true, timeout: 120000 })
      await connectRequestWindow.waitForSelector('#ARBITRUM', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'uniswap-arbitrum-connect-request-window-issue')
      expect(e, 'Uniswap injection ARBITRUM not listed, connect request window loading issue.....').equals(null)
    }
    await connectRequestWindow.click('#ARBITRUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    // Check web3 status as connected
    const connectedChainDetails = await dappPage.evaluate(async () => {
      const chainIDHexadecimal = await window.ethereum.request({ method: 'eth_chainId', params: [] })
      return {
        chainId: parseInt(chainIDHexadecimal, 16),
        connectedAddress: await window.ethereum.request({ method: 'eth_accounts' })
      }
    })
    expect(connectedChainDetails.chainId, 'Uniswap ethereum dapp connection issue').equals(arbitrumChainId)
    expect(connectedChainDetails.connectedAddress[0], 'Uniswap ethereum dapp connection issue')
      .equals('0x3f429e2212718a717bd7f9e83ca47dab7956447b')
  })
})
