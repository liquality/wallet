const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const SwapPage = require('../../pages/SwapPage')
const expect = require('chai').expect
const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()

let browser, page

describe('ThoreChain SWAP provider["MAINNET", "PULL_REQUEST_TEST"]', async () => {
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
    await passwordPage.SubmitPasswordDetails(page)
    // overview page
    await overviewPage.CloseWatsNewModal(page)
    await overviewPage.HasOverviewPageLoaded(page)
  })
  afterEach(async () => {
    await browser.close()
  })

  it('BTC->ETH - Thorchain', async () => {
    const fromAsset = 'BTC'
    const toAsset = 'ETH'

    // Click on BTC then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector('#BTC_swap_button', { visible: true })
    await page.click(`#${fromAsset}_swap_button`)
    console.log(`User clicked on ${fromAsset} SWAP button`)
    // Select toAsset
    await page.click('.swap-receive-main-icon')
    let ethereumNetwork = await page.waitForSelector('#ETHEREUM', { timeout: 90000, visible: true })
    await ethereumNetwork.click()
    await page.waitForSelector(`#${toAsset}`, { visible: true })
    await page.click(`#${toAsset}`)
    console.log(`User selected ${toAsset} as 2nd pair for swap`)

    try {
      await page.waitForSelector(`#${toAsset}_swap_receive_pair_asset`, {
        visible: true,
        timeout: 10000
      })
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        expect(
          e,
          'BTC>ETH swap ETH should be automatically selected as to assert, something is wrong'
        ).to.be.null
      }
    }
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'BTC to ETH SWAP min value not set in input').not.equals('0.0000')
    await swapPage.ClickOnMin(page)
    // Check source name
    await page.waitForSelector('#selectedQuote_provider', { visible: true })
    try {
      const selectedQuoteProviderText = await page.$eval(
        '#selectedQuote_provider',
        (el) => el.textContent
      )
      if (selectedQuoteProviderText === 'Liquality') {
        await page.click('#see_all_quotes', { delay: 1000 })
        await page.waitForSelector('#thorchain_rate_provider', { visible: true })
        await page.click('#thorchain_rate_provider', { delay: 1000 })
        await page.click('#select_quote_button', { delay: 1000 })
      }
    } catch (e) {
      await testUtil.takeScreenshot(page, 'thorechain_swap_provider_not_found')
      expect(e, 'Thorchain quote provider error!!').equals(null)
    }

    expect(
      await swapPage.getSelectedServiceProvider(page),
      'BTC->ETH swap, Thorchain source should be chosen!'
    ).oneOf(['Thorchain'])
  })
  it('ETH->BTC - Thorchain', async () => {
    // Click on BTC then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, 'ETH')
    await page.waitForSelector('#ETH_swap_button', { visible: true })
    await page.click('#ETH_swap_button')
    console.log('User clicked on ETH SWAP button')
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'BTC to ETH SWAP min value not set in input').not.equals('0.0000')
    await swapPage.ClickOnMin(page)
    // Check source name
    await page.waitForSelector('#selectedQuote_provider', { visible: true })
    try {
      const selectedQuoteProviderText = await page.$eval(
        '#selectedQuote_provider',
        (el) => el.textContent
      )
      if (selectedQuoteProviderText === 'Liquality') {
        await page.click('#see_all_quotes', { delay: 1000 })
        await page.waitForSelector('#thorchain_rate_provider', { visible: true })
        await page.click('#thorchain_rate_provider', { delay: 1000 })
        await page.click('#select_quote_button', { delay: 1000 })
      }
    } catch (e) {
      await testUtil.takeScreenshot(page, 'thorechain_swap_provider_not_found')
      expect(e, 'Thorchain quote provider error!!').equals(null)
    }

    expect(
      await swapPage.getSelectedServiceProvider(page),
      'ETH->BTC swap, Thorchain source should be chosen!'
    ).oneOf(['Thorchain'])
  })
})
