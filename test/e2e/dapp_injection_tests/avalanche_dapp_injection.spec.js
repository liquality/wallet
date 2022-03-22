const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const puppeteer = require('puppeteer')
const { expect } = require('chai')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page, dappPage
const password = '123123123'

const pangolin_Url = 'https://app.pangolin.exchange/'
const chainId = 43114

describe('Avalanche Dapp injection-["MAINNET","PULL_REQUEST_TEST"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
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
    // Default web3 option toggled on
    await overviewPage.CheckWeb3ToggleOn(page)
    // Connected dapp option
    await page.click('#connect_dapp_main_option')
    await page.waitForSelector('.v-switch-core', { visible: true })

    await page.click('#dropdown-item', { delay: 1000 })
    await page.waitForSelector('#avalanche_web_network', { visible: true })
    await page.click('#avalanche_web_network', { delay: 1000 })

    // Go to dpp app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
  })
  it('Avalanche pangolin Exchange dapp injection', async () => {
    await dappPage.goto(pangolin_Url, { timeout: 60000, waitUntil: 'load' })
    // Before click on injected wallet option.
    await dappPage.evaluate(async () => {
      window.ethereum.enable()
    })
    const newPagePromise = new Promise((x) =>
      browser.once('targetcreated', (target) => x(target.page()))
    ) /* eslint-disable-line */
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', {
        visible: true,
        timeout: 120000
      })
      await connectRequestWindow.waitForSelector('#AVALANCHE', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'Avalanche-dapp-connect-request-issue')
      expect(e, 'Avalanche injection not listed, connected window not loaded.....').equals(null)
    }
    const rskAccounts = await connectRequestWindow.$$('#AVALANCHE')
    expect(
      rskAccounts.length,
      '1 AVALANCHE accounts should be listed under Connect request popupWindow'
    ).to.equals(1)
    await connectRequestWindow.click('#AVALANCHE')
    // click Next button
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', {
      visible: false,
      timeout: 60000
    })
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    // Check web3 status as connected against dapp Ui.
    const connectedChainDetails = await dappPage.evaluate(async () => {
      const chainIDHexadecimal = await window.ethereum.request({
        method: 'eth_chainId',
        params: []
      })
      return {
        chainId: parseInt(chainIDHexadecimal, 16),
        connectedAddress: await window.ethereum.request({ method: 'eth_accounts' })
      }
    })
    expect(
      connectedChainDetails.chainId,
      'Avalanche chain ID is not expected after dapp connection'
    ).equals(chainId)
    expect(
      connectedChainDetails.connectedAddress[0],
      'Avalanche connected address is not expected after dapp connection'
    ).equals('0x3f429e2212718a717bd7f9e83ca47dab7956447b')

    await page.bringToFront()
  })

  afterEach(async () => {
    await browser.close()
  })
})
