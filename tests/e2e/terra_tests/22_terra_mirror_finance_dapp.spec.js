const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../Pages/OverviewPage')
const HomePage = require('../../Pages/HomePage')
const PasswordPage = require('../../Pages/PasswordPage')
const puppeteer = require('puppeteer')
const { expect } = require('chai')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page, dappPage
const password = '123123123'
const dappUrl = 'https://terra.mirror.finance/'

describe('Terra Mirror Finance DAPP injection-[mainnet,smoke]', async () => {
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
    // Navigate to dapp
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1500,
      height: 800
    })
  })
  it('Terra mirror finance', async () => {
    await dappPage.goto(dappUrl, { timeout: 60000, waitUntil: 'load' })
    try {
      await dappPage.waitForSelector("button[class*='ConnectButton']", { visible: true, timeout: 60000 })
    } catch (e) {
      await dappPage.screenshot({ path: 'screenshots/terra-mirror-finance-dapp-loading-issue.png', fullscreen: true })
      const pageTitle = await dappPage.title()
      const pageUrl = await dappPage.url()
      expect(e, `Terra mirror finance not loading.....${pageTitle}...${pageUrl}`).equals(null)
    }
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    // Click on Connect wallet option
    await dappPage.click("button[class*='ConnectButton']")
    await dappPage.waitForSelector("button[class*='ConnectList_button']")
    const connectionListButtons = await dappPage.$$("button[class*='ConnectList_button']")
    connectionListButtons[0].click()

    await dappPage.waitForTimeout(2000)
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', { visible: true, timeout: 90000 })
    } catch (e) {
      await connectRequestWindow.screenshot({ path: 'screenshots/terra-mirror-finance--issue.png', fullscreen: true })
      expect(e, 'Terra mirror finance app UI not loading TERRA accounts').equals(null)
    }
    const rskAccounts = await connectRequestWindow.$$('#TERRA')
    expect(rskAccounts.length, '1 TERRA accounts should be listed under Connect request popupWindow')
      .to.equals(1)
    await connectRequestWindow.click('#TERRA')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    await dappPage.waitForSelector('div[class*="Connected_button"]', { visible: true, timeout: 60000 })
  })
  after(async () => {
    await browser.close()
  })
})
