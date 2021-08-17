const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page
const password = '123123123'

describe.only('Dapp Injection-[mainnet]', async () => {
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
  })

  it('Uniswap Dapp injection ETH chain', async () => {
    // Go to uniSwap app
    const dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto('https://app.uniswap.org/#/swap')
    await dappPage.waitForSelector('#connect-wallet', { visible: true })
    await dappPage.click('#connect-wallet')
    // connect-INJECTED
    await dappPage.waitForSelector('#connect-INJECTED', { visible: true })
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.click('#connect-INJECTED')
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#ETHEREUM', { visible: true })
    await connectRequestWindow.click('#ETHEREUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e);

    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
  it('Sushi injection ETH chain', async () => {
    // Go to Sushi app
    const dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto('https://app.sushi.com/swap')
    await dappPage.waitForSelector('#connect-wallet', { visible: true })
    await dappPage.click('#connect-wallet')
    // select a wallet type as Injected
    await dappPage.waitForXPath('//div[contains(text(),\'Injected\')]', { visible: true })
    const walletConnect = await dappPage.$x('//div[contains(text(),\'Injected\')]')
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await walletConnect[0].click()
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#ETHEREUM', { visible: true })
    await connectRequestWindow.click('#ETHEREUM')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e);

    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
  it('Sushi injection Polygon chain', async () => {
    // Select polygon network
    await page.click('#dropdown-item')
    await page.waitForSelector('#polygon_web_network', { visible: true })
    await page.click('#polygon_web_network')

    // Go to Sushi app
    const dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
    await dappPage.goto('https://app.sushi.com/swap')
    await dappPage.waitForSelector('#connect-wallet', { visible: true })
    await dappPage.click('#connect-wallet')
    // select a wallet type as Injected
    await dappPage.waitForXPath('//div[contains(text(),\'Injected\')]', { visible: true })
    const walletConnect = await dappPage.$x('//div[contains(text(),\'Injected\')]')
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await walletConnect[0].click()
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#POLYGON', { visible: true })
    await connectRequestWindow.click('#POLYGON')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e);

    // Check web3 status as connected
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })

  afterEach(async () => {
    try {
      console.log('Cleaning up instances')
      await page.close()
      await browser.close()
    } catch (e) {
      console.log('Cannot cleanup instances')
    }
  })
})
