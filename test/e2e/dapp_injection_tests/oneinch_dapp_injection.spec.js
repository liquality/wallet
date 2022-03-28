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

let browser, page
const password = '123123123'
const dappUrl = 'https://app.1inch.io'

describe('1Inch Dapp Injection-["MAINNET","PULL_REQUEST_TEST"]', async () => {
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
    // Web3 toggle on by default
    await overviewPage.CheckWeb3ToggleOn(page)
    // Connected dapp option
    await page.click('#connect_dapp_main_option')
    await page.waitForSelector('.v-switch-core', { visible: true })
  })
  afterEach(async () => {
    await browser.close()
  })
  it('1Inch injection - ETH["MAINNET_RELEASE"]', async () => {
    let chain = 'ethereum'

    // Go to 1inch app
    const dappPage = await browser.newPage()
    await dappPage.goto(dappUrl, { waitUntil: 'load', timeout: 90000 })
    // Before click on injected wallet option.
    const newPagePromise = new Promise((x) =>
      browser.once('targetcreated', (target) => x(target.page()))
    ) /* eslint-disable-line */
    await dappPage.evaluate(async () => {
      window.ethereum.enable()
    })
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#filter_by_chain', {
      visible: true,
      timeout: 90000
    })
    await connectRequestWindow.click('#filter_by_chain').catch((e) => e)
    await connectRequestWindow.waitForSelector(`#${chain}_web_network`, { visible: true })
    await connectRequestWindow.click(`#${chain}_web_network`, { delay: 1000 })

    await connectRequestWindow.waitForSelector('#ETHEREUM', { visible: true })
    await connectRequestWindow.click('#ETHEREUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', {
      visible: false,
      timeout: 60000
    })
    // check origin url
    await connectRequestWindow
      .$eval('#origin_url', (el) => el.innerText)
      .then((text) => expect(text).to.contains(dappUrl))
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
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
    expect(connectedChainDetails.chainId, 'Uniswap ethereum dapp connection issue').equals(1)
    expect(
      connectedChainDetails.connectedAddress[0],
      'Uniswap ethereum dapp connection issue'
    ).equals('0x3f429e2212718a717bd7f9e83ca47dab7956447b')
  })
  it.skip('1Inch injection - BSC', async () => {
    let chain = 'bsc'

    // Select correct network
    await page.click('#dropdown-item', { delay: 1000 })
    await page.waitForSelector(`#${chain}_web_network`, { visible: true })
    await page.click(`#${chain}_web_network`, { delay: 2000 })

    // Go to 1inch app
    const dappPage = await browser.newPage()
    await dappPage.goto(dappUrl, { waitUntil: 'load', timeout: 90000 })
    // Before click on injected wallet option.
    const newPagePromise = new Promise((x) =>
      browser.once('targetcreated', (target) => x(target.page()))
    ) /* eslint-disable-line */
    await dappPage.evaluate(async () => {
      window.ethereum.enable()
    })
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#filter_by_chain', { visible: true })
    await connectRequestWindow.click('#filter_by_chain').catch((e) => e)
    await connectRequestWindow.waitForSelector(`#${chain}_web_network`, { visible: true })
    await connectRequestWindow.click(`#${chain}_web_network`, { delay: 1000 })

    await connectRequestWindow.waitForSelector('#BSC', { visible: true })
    await connectRequestWindow.click('#BSC')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', {
      visible: false,
      timeout: 60000
    })
    // check origin url
    await connectRequestWindow
      .$eval('#origin_url', (el) => el.innerText)
      .then((text) => expect(text).to.contains(dappUrl))
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
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
    expect(connectedChainDetails.chainId, 'Uniswap bsc dapp connection issue').equals(56)
    expect(connectedChainDetails.connectedAddress[0], 'Uniswap bsc dapp connection issue').equals(
      '0x3f429e2212718a717bd7f9e83ca47dab7956447b'
    )
  })
})
