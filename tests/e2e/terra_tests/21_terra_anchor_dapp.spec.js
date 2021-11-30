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
const dappUrl = 'https://app.anchorprotocol.com/'

describe('Terra Anchor Dapp injection-[testnet,smoke]', async () => {
  before(async () => {
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
    // Go to ANCHOR app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
  })
  it('Terra anchorprotocol injection', async () => {
    await dappPage.goto(dappUrl, { timeout: 60000, waitUntil: 'load' })
    try {
      await dappPage.waitForSelector("a[href='/mypage']", { visible: true, timeout: 60000 })
      await dappPage.waitForSelector('.wallet-icon', { visible: true, timeout: 60000 })
    } catch (e) {
      await dappPage.screenshot({ path: 'screenshots/anchorprotocol-dapp-loading-issue.png', fullscreen: true })
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Terra anchorprotocol not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    // Click on Connect wallet option
    try {
      await dappPage.waitForXPath("//span[normalize-space()='Connect Wallet']")
      await dappPage.click('.wallet')
      const walletConnect = await dappPage.waitForXPath("//span[normalize-space()='Terra Station']", { visible: true, timeout: 60000 })
      await walletConnect.click()
    } catch (e) {
      await testUtil.takeScreenshot(page, 'anchorprotocol-dapp-connect-chrome-extension-issue')
      expect(e, 'Terra anchorprotocol not connect.....').equals(null)
    }

    await connectionPage.selectAccount(await newPagePromise, 'TERRA', 1)

    await dappPage.waitForSelector('.wallet-balance', { visible: true, timeout: 60000 })
    // Check Transfer button on Bridge is displayed
    expect(await dappPage.$eval('.wallet-balance', el => el.textContent), 'Terra anchor injection failed!')
      .contains('UST')
  })
  after(async () => {
    await browser.close()
  })
})
