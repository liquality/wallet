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
let bridgeUrl = 'https://bridge.test.sovryn.app/'

describe('RSK Bridge Injection-[mainnet,smoke]', async () => {
  beforeEach(async () => {
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
      bridgeUrl = 'https://bridge.sovryn.app/'
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
    const connectRequestWindow = await newPagePromise
    try {
      await connectRequestWindow.waitForSelector('#connect_request_button', { visible: true, timeout: 90000 })
    } catch (e) {
      await connectRequestWindow.screenshot({ path: 'screenshots/sovryn-bridge-show-rskAccounts-issue.png', fullscreen: true })
      expect(e, 'Sovryn bridge UI not loading RSK accounts').equals(null)
    }
    const rskAccounts = await connectRequestWindow.$$('#RSK')
    expect(rskAccounts.length, '2 RSK accounts should be listed under Connect request popupWindow')
      .to.equals(2) // RSK & RSK legacy
    await connectRequestWindow.click('#RSK')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    await dappPage.waitForTimeout(10000)
    // Check Transfer button on Bridge is displayed
    expect(await dappPage.$eval('button[type="button"]', el => el.textContent), 'Sovryn bridge is not displayed, ' +
      'Transfer button not displayed')
      .contains('Transfer')
  })
  it.skip('SOVRYN dApp injection', async () => {
    await dappPage.goto('https://live.sovryn.app/')
    const closeATradeOption = await dappPage.$x('//button[.=\'Please let me close a trade\']')
    closeATradeOption[0].click()
    const engageWallet = await dappPage.$x('//span[.=\'Engage wallet\']')
    engageWallet[0].click()
    const browser = await dappPage.$x('//div[text()=\'Browser\']')
    browser[0].click()
    // Before click on injected wallet option.
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))) /* eslint-disable-line */
    // Click on Connect wallet option from bridge
    const liquality = await dappPage.$x('//div[.=\'Liquality\']')
    liquality[0].click()
    const connectRequestWindow = await newPagePromise
    await connectRequestWindow.waitForSelector('#RSK', { visible: true })
    const rskAccounts = await connectRequestWindow.$$('#RSK')
    expect(rskAccounts.length).to.equals(2)
    await connectRequestWindow.click('#RSK')
    // Check connect button is enabled
    await connectRequestWindow.click('#connect_request_button').catch(e => e)

    await dappPage.waitForTimeout(10000)
    await dappPage.waitForSelector('#web3-status-connected', { visible: true })
  })
  afterEach(async () => {
    await browser.close()
  })
})
