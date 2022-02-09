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
const dappUrl = 'https://mirrorprotocol.app/#/trade/'

describe('Terra Mirror Finance DAPP injection-["MAINNET"]', async () => {
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
    // Default web3 option toggled on
    await overviewPage.ClickWeb3WalletToggle(page)
    await page.waitForTimeout(2000)
    // Connected dapp option
    await page.click('#connect_dapp_main_option')
    await page.waitForSelector('.v-switch-core', { visible: true })
    // Navigate to dapp
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1500,
      height: 800
    })
  })
  it('Terra mirror finance', async () => {
    await dappPage.goto(dappUrl, { timeout: 90000, waitUntil: 'load' })
    // Before click on injected wallet option.
    await dappPage.evaluate(async () => {
      window.terra.enable()
    })
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', { visible: true, timeout: 120000 })
      await connectRequestWindow.waitForSelector('#TERRA', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'rsk-sovryn-dapp-connect-request-issue')
      expect(e, 'RSK sovryn injection ethereum not listed, connected window not loaded.....').equals(null)
    }

    const rskAccounts = await connectRequestWindow.$$('#TERRA')
    expect(rskAccounts.length, '1 TERRA accounts should be listed under Connect request popupWindow')
      .to.equals(1)
    await connectRequestWindow.click('#TERRA')
    // click Next button
    await connectRequestWindow.click('#connect_request_button').catch(e => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', { visible: false, timeout: 60000 })
    await connectRequestWindow.click('#connect_request_button').catch(e => e)
  })
  after(async () => {
    await browser.close()
  })
})
