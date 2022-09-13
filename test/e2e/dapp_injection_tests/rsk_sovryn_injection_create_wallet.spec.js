const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const puppeteer = require('puppeteer')
const { expect } = require('chai')
const SeedWordsPage = require('../../pages/SeedWordsPage')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const seedWordsPage = new SeedWordsPage()
const passwordPage = new PasswordPage()

let browser, page, dappPage
let bridgeUrl = 'https://bridge.sovryn.app/'
let sovrynUrl = 'https://live.sovryn.app/'

describe('RSK Bridge & Sovryn dapp Injection as create a new wallet-["MAINNET","PULL_REQUEST_TEST"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'networkidle2' })
    // Create new wallet
    await homePage.ClickOnCreateNewWallet(page)
    // Terms & conditions
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
    // Unlocking wallet...
    const seed1 = (await seedWordsPage.GetBackupSeedWords(page)).seed1
    const seed5 = (await seedWordsPage.GetBackupSeedWords(page)).seed5
    const seed12 = (await seedWordsPage.GetBackupSeedWords(page)).seed12
    // Click Next
    await seedWordsPage.ClickOnWalletNextButton(page)
    // Enter seed1,5,.12
    await seedWordsPage.EnterSeedWords(page, seed1, seed5, seed12)
    await seedWordsPage.ClickContinueButton(page)
    // Set password & click next
    await passwordPage.SubmitPasswordDetails(page)
    // overview page
    await overviewPage.CloseWhatsNewModal(page)
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
    await dappPage.goto(bridgeUrl, { timeout: 0, waitUntil: 'load' })
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
      // await testUtil.takeScreenshot(connectRequestWindow, 'rsk-sovryn-dapp-connect-request-issue')
      expect(
        e,
        'RSK sovryn injection ethereum not listed, connected window not loaded.....'
      ).equals(null)
    }

    const rskAccounts = await connectRequestWindow.$$('#RSK')
    expect(
      rskAccounts.length,
      'only one RSK account should be listed for create new wallet dapp injection'
    ).to.equals(1)

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
  it('SOVRYN dApp injection with create wallet', async () => {
    await dappPage.goto(sovrynUrl, { timeout: 0, waitUntil: 'load' })
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
      expect(e, 'RSK sovryn injection RSK not listed, connected window not loaded').equals(null)
    }

    const rskAccounts = await connectRequestWindow.$$('#RSK')
    expect(
      rskAccounts.length,
      'only one RSK account should be listed for create new wallet dapp injection'
    ).to.equals(1)

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
