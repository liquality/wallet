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

let bridgeUrl = 'https://bridge.sovryn.app/'
let sovrynUrl = 'https://live.sovryn.app/'
let alphaMoneyOnChains = 'https://alpha.moneyonchain.com/'

describe('RSK Bridge & Sovryn dapp Injection-["MAINNET","PULL_REQUEST_TEST","MAINNET_RELEASE"]', async () => {
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
    // Select rsk
    await page.click('#dropdown-item', { delay: 1000 })
    await page.waitForSelector('#rsk_web_network', { visible: true })
    await page.click('#rsk_web_network', { delay: 1000 })

    // Go to SOVRYN app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
  })
  it('SOVRYN Bridge injection', async () => {
    await dappPage.goto(bridgeUrl, { timeout: 60000, waitUntil: 'load' })
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
      await connectRequestWindow.waitForSelector('#RSK', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'rsk-sovryn-dapp-connect-request-issue')
      expect(
        e,
        'RSK sovryn injection ethereum not listed, connected window not loaded.....'
      ).equals(null)
    }

    const rskAccounts = await connectRequestWindow.$$('#RSK')
    expect(
      rskAccounts.length,
      'rsk & rsk legacy accounts not listed after dapp connection'
    ).to.equals(2)

    await connectRequestWindow.waitForSelector('#dropdown-item', { visible: true })
    let filterValues = await connectRequestWindow.evaluate(() => {
      const dropdownItems = document.querySelectorAll('#dropdown-item')
      const filterValues = []
      for (let i = 0; i < dropdownItems.length; i++) {
        filterValues.push(dropdownItems[i].innerText)
      }
      return filterValues
    })
    expect(
      filterValues,
      'Sovryn dapp injection RSK not listed, connected window not loaded.....'
    ).to.include('Rootstock (RSK)')

    // click Next button
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', {
      visible: false,
      timeout: 60000
    })
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
  })
  it('SOVRYN dApp injection', async () => {
    await dappPage.goto(sovrynUrl, { timeout: 60000, waitUntil: 'load' })
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
      await connectRequestWindow.waitForSelector('#RSK', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'rsk-sovryn-dapp-connect-request-issue')
      expect(
        e,
        'RSK sovryn injection ethereum not listed, connected window not loaded.....'
      ).equals(null)
    }

    const rskAccounts = await connectRequestWindow.$$('#RSK')
    expect(
      rskAccounts.length,
      'rsk & rsk legacy accounts not listed after dapp connection'
    ).to.equals(2)

    await connectRequestWindow.waitForSelector('#dropdown-item', { visible: true })
    let filterValues = await connectRequestWindow.evaluate(() => {
      const dropdownItems = document.querySelectorAll('#dropdown-item')
      const filterValues = []
      for (let i = 0; i < dropdownItems.length; i++) {
        filterValues.push(dropdownItems[i].innerText)
      }
      return filterValues
    })
    expect(
      filterValues,
      'Sovryn dapp injection RSK not listed, connected window not loaded.....'
    ).to.include('Rootstock (RSK)')

    // click Next button
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
    await connectRequestWindow.waitForSelector('#make_sure_you_trust_this_site', {
      visible: false,
      timeout: 60000
    })
    await connectRequestWindow.click('#connect_request_button').catch((e) => e)
  })
  it('alphaMoneyOnChain dApp injection', async () => {
    await dappPage.goto(alphaMoneyOnChains, { timeout: 60000, waitUntil: 'load' })
    // Before click on injected wallet option.
    await dappPage.evaluate(async () => {
      window.rsk.enable()
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
      await connectRequestWindow.waitForSelector('#RSK', { visible: true, timeout: 60000 })
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, 'rsk-sovryn-dapp-connect-request-issue')
      expect(
        e,
        'RSK sovryn injection ethereum not listed, connected window not loaded.....'
      ).equals(null)
    }

    const rskAccounts = await connectRequestWindow.$$('#RSK')
    expect(
      rskAccounts.length,
      'rsk & rsk legacy accounts not listed after dapp connection'
    ).to.equals(2)

    await connectRequestWindow.waitForSelector('#dropdown-item', { visible: true })
    let filterValues = await connectRequestWindow.evaluate(() => {
      const dropdownItems = document.querySelectorAll('#dropdown-item')
      const filterValues = []
      for (let i = 0; i < dropdownItems.length; i++) {
        filterValues.push(dropdownItems[i].innerText)
      }
      return filterValues
    })
    expect(
      filterValues,
      'Sovryn dapp injection RSK not listed, connected window not loaded.....'
    ).to.include('Rootstock (RSK)')

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
