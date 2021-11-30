const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../Pages/OverviewPage')
const HomePage = require('../../Pages/HomePage')
const PasswordPage = require('../../Pages/PasswordPage')
const ConnectionPage = require('../../Pages/ConnectionPage')
const puppeteer = require('puppeteer')
const { expect } = require('chai')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const connectionPage = new ConnectionPage()

let browser, page, dappPage
const password = '123123123'
let bridgeUrl = 'https://bridge.test.sovryn.app/'
let swapURL = 'https://test.sovryn.app/'

describe('RSK Bridge Injection-[mainnet,smoke]', async () => {
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
      bridgeUrl = 'https://bridge.sovryn.app/'
      swapURL = 'https://live.sovryn.app/'
    } else {
      await overviewPage.SelectNetwork(page)
    }
    // Web3 toggle on
    await overviewPage.ClickWeb3WalletToggle(page)

    // Go to SOVRYN app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
  })
  it('SOVRYN Bridge injection', async () => {
    await dappPage.goto(bridgeUrl, { timeout: 60000, waitUntil: 'load' })
    try {
      await dappPage.waitForSelector('button[type="button"]', { visible: true, timeout: 60000 })
    } catch (e) {
      await dappPage.screenshot({ path: 'screenshots/sovryn-bridge-loading-issue.png', fullscreen: true })
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Sovryn bridgeUI not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    // Click on Connect wallet option from bridge
    await dappPage.click('button[type="button"]')

    await connectionPage.selectAccount(await newPagePromise, 'RSK', 2)

    await dappPage.waitForTimeout(10000)
    // Check Transfer button on Bridge is displayed
    expect(await dappPage.$eval('button[type="button"]', el => el.textContent), 'Sovryn bridge is not displayed, ' +
      'Transfer button not displayed')
      .contains('Transfer')
  })
  it('SOVRYN dApp injection', async () => {
    await dappPage.goto(swapURL)
    await dappPage.waitForTimeout(1000)

    const iUnderstandCheckbox = await dappPage.$x('//label[.=\'I have read and understand that I am responsible for my own Sovrynity\']')
    iUnderstandCheckbox[0].click()

    const iUnderstandButton = await dappPage.$x('//button[.=\'I Understand\']')
    iUnderstandButton[0].click()

    const closeATradeOption = await dappPage.$x('//button[.=\'Please let me close a trade\']')
    if (closeATradeOption.length !== 0) {
      closeATradeOption[0].click()
    }

    await dappPage.waitForTimeout(1000)
    const connectWalletButton = await dappPage.$x('//span[.=\'Connect wallet\']')
    connectWalletButton[0].click()

    await dappPage.waitForTimeout(1000)
    const connectionTypeSelector = await dappPage.$x('//div[text()=\'Browser\']')
    connectionTypeSelector[0].click()

    await dappPage.waitForTimeout(1000)
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    await dappPage.evaluate(async () => {
      window.ethereum.enable()
    })

    // Click on Connect wallet option from bridge.
    const liquality = await dappPage.$x('//div[text()=\'Liquality\']')
    liquality[0].click()

    await connectionPage.selectAccount(await newPagePromise, 'RSK', 2)

    // Click once again if needed.
    const liquality1 = await dappPage.$x('//div[text()=\'Liquality\']')
    if (liquality1.length !== 0) {
      liquality1[0].click()
    }

    // Check if 'Deposit' button appeared.
    await dappPage.waitForTimeout(10000)
    const depositButton = await dappPage.$x('//span[text()=\'Deposit\']')
    expect(depositButton.length).equals(1)
  })
  afterEach(async () => {
    await browser.close()
  })
})
