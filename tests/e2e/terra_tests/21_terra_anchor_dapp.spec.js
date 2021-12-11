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
const dappUrl = 'https://app.anchorprotocol.com/'

describe('Terra Anchor Dapp injection-[testnet,smoke]', async () => {
  before(async () => {
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
    // Go to SOVRYN app
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
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', { visible: true, timeout: 90000 })
    } catch (e) {
      await connectRequestWindow.screenshot({ path: 'screenshots/terra-show-terra-issue.png', fullscreen: true })
      expect(e, 'Anchor app UI not loading TERRA accounts').equals(null)
    }
    const rskAccounts = await connectRequestWindow.$$('#TERRA')
    expect(rskAccounts.length, '1 TERRA accounts should be listed under Connect request popupWindow')
      .to.equals(1)
    await connectRequestWindow.click('#TERRA')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    await dappPage.waitForSelector('.wallet-balance', { visible: true, timeout: 60000 })
    // Check Transfer button on Bridge is displayed
    expect(await dappPage.$eval('.wallet-balance', el => el.textContent), 'Terra anchor injection failed!')
      .contains('UST')
  })
  after(async () => {
    await browser.close()
  })
})
