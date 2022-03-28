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
const password = '123123123'

describe('UNISWAP service Provider-["MAINNET","PULL_REQUEST_TEST"]', async () => {
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
  })
  afterEach(async () => {
    await browser.close()
  })

  it.skip('ETH->DAI swap - UNISWAP V2', async () => {
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
    await swapPage.ClickOnMax(page)
    // Rate & source provider validation (ETH->DAI source chosen is Uniswap V2)
    await page.waitForSelector('#selectedQuote_provider', {
      visible: true,
      timeout: 60000
    })
    expect(
      await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'ETH->DAI, Supporting source should be chosen!'
    ).oneOf(['Uniswap V2', 'Thorchain', 'Liquality'])

    // Click on Network speed + FEE & Validate
    const networkSpeedFee = await page.$eval(
      '#details_header_chevron_down_icon',
      (el) => el.textContent
    )
    expect(networkSpeedFee).contain(fromAsset + ' Avg')
  })
})
