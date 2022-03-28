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

const anchorProtocol_Url = 'https://app.anchorprotocol.com/'
const mirrorProtocol_Url = 'https://mirrorprotocol.app/#/trade/'
const terra_swap_Url = 'https://app.terraswap.io'

describe('Terra Dapp injection-["MAINNET","PULL_REQUEST_TEST"]', async () => {
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
    await overviewPage.SelectNetwork(page, 'mainnet')
    // Default web3 option toggled on
    await overviewPage.CheckWeb3ToggleOn(page)
    // Connected dapp option
    await page.click('#connect_dapp_main_option')
    await page.waitForSelector('.v-switch-core', { visible: true })
    // Go to dpp app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
  })
  it('Terra anchorprotocol dapp injection', async () => {
    await dappPage.goto(anchorProtocol_Url, { timeout: 60000, waitUntil: 'load' })
    // Before click on injected wallet option.
    await dappPage.evaluate(async () => {
      window.terra.enable()
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
      await connectRequestWindow.waitForSelector('#TERRA', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(
        connectRequestWindow,
        'terra-anchorprotocol-dapp-connect-request-issue'
      )
      expect(
        e,
        'Terra anchorprotocol sovryn injection LUNA not listed, connected window not loaded.....'
      ).equals(null)
    }
    const rskAccounts = await connectRequestWindow.$$('#TERRA')
    expect(
      rskAccounts.length,
      '1 TERRA accounts should be listed under Connect request popupWindow'
    ).to.equals(1)
    await connectRequestWindow.click('#TERRA')
    // click Next button
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', {
      visible: false,
      timeout: 60000
    })
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
  })
  it('Terra mirror finance dapp injection', async () => {
    await dappPage.goto(mirrorProtocol_Url, { timeout: 90000, waitUntil: 'load' })
    // Before click on injected wallet option.
    await dappPage.evaluate(async () => {
      window.terra.enable()
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
      await connectRequestWindow.waitForSelector('#TERRA', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'rsk-sovryn-dapp-connect-request-issue')
      expect(
        e,
        'RSK sovryn injection ethereum not listed, connected window not loaded.....'
      ).equals(null)
    }

    const rskAccounts = await connectRequestWindow.$$('#TERRA')
    expect(
      rskAccounts.length,
      '1 TERRA accounts should be listed under Connect request popupWindow'
    ).to.equals(1)
    await connectRequestWindow.click('#TERRA')
    // click Next button
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', {
      visible: false,
      timeout: 60000
    })
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
  })
  it('Terra swap dapp injectin https://app.terraswap.io', async () => {
    await dappPage.goto(terra_swap_Url, { timeout: 90000, waitUntil: 'load' })
    // Before click on injected wallet option.
    await dappPage.evaluate(async () => {
      window.terra.enable()
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
      await connectRequestWindow.waitForSelector('#TERRA', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'rsk-sovryn-dapp-connect-request-issue')
      expect(
        e,
        'RSK sovryn injection ethereum not listed, connected window not loaded.....'
      ).equals(null)
    }

    const rskAccounts = await connectRequestWindow.$$('#TERRA')
    expect(
      rskAccounts.length,
      '1 TERRA accounts should be listed under Connect request popupWindow'
    ).to.equals(1)
    await connectRequestWindow.click('#TERRA')
    // click Next button
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', {
      visible: false,
      timeout: 60000
    })
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
  })

  afterEach(async () => {
    await browser.close()
  })
})
