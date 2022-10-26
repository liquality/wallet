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

describe('UNISWAP service Provider-["MAINNET","PULL_REQUEST_TEST"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 0 })
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page)
    // overview page
    await overviewPage.CloseWhatsNewModal(page)
    await overviewPage.HasOverviewPageLoaded(page)
  })
  afterEach(async () => {
    await browser.close()
  })

  it('ETH->DAI swap - UNISWAP V2', async () => {
    const fromAsset = 'ETH'
    const toAsset = 'DAI'
    // Click on ETH then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector(`#${fromAsset}_swap_button`, { visible: true })
    await page.click(`#${fromAsset}_swap_button`)

    // Validate min SEND amount from text field & check Min is Active
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'ETH to DAI SWAP min value not set in input').not.equals('0.0000')
    // Select 2nd Pair (DAI)
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector('#ETHEREUM', { visible: true })
    await page.click('#ETHEREUM')
    await page.waitForSelector(`#${toAsset}`, { visible: true })
    await page.click(`#${toAsset}`)
    // Rate & source provider validation (ETH->DAI source chosen is Uniswap V2)
    await page.waitForSelector('#selectedQuote_provider', {
      visible: true,
      timeout: 60000
    })

    const selectedQuoteProvider = await swapPage.getSelectedServiceProvider(page)
    if (selectedQuoteProvider.trim().includes('uniswap')) {
    } else {
      await page.waitForSelector('#see_all_quotes', { visible: true })
      // Select uniswap Boost
      await page.waitForSelector('#see_all_quotes', { visible: true })
      await page.click('#see_all_quotes')
      await page.waitForSelector('#uniswapV2_rate_provider', { visible: true })
      await page.click('#uniswapV2_rate_provider')
      await page.click('#select_quote_button')
    }

    expect(
      await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'ETH->DAI, Supporting source should be chosen!'
    ).oneOf(['Uniswap V2', 'Thorchain'])

    // Click on Network speed + FEE & Validate
    await page.click('#details_header_chevron_down_icon')
    const networkSpeedFeeDetails = await page.$eval(
      '.selectors-asset',
      (el) => el.textContent
    )
    expect(networkSpeedFeeDetails).contain(fromAsset)
  })
})
