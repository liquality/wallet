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

// Sovryn AMM works against RSK chain
describe.skip('SWAP Sovryn AMM service Provider-[mainnet,smoke]', async () => {
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
    // Select correct network based on Env
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
  })
  after(async () => {
    try {
      await page.close()
      await browser.close()
    } catch (e) {
      throw new Error(e)
    }
  })
  it('should be able to SWAP using sovryn AMM', async () => {
    const fromAsset = 'RBTC'
    const toAsset = {
      chain: 'RSK',
      coin: 'SOV'
    }
    // Click on ETH then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector(`#${fromAsset}_swap_button`, { visible: true })
    await page.click(`#${fromAsset}_swap_button`)
    // Validate min SEND amount from text field & check Min is Active
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, `${fromAsset} to ${toAsset} SWAP min value not set in input`)
      .not.equals('0.0000')
    await swapPage.ClickOnMin(page)
    // Select 2nd Pair
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector(`#${toAsset.chain}`, { visible: true })
    await page.click(`#${toAsset.chain}`)
    await page.waitForSelector(`#${toAsset.coin}`, { visible: true })
    await page.click(`#${toAsset.coin}`)
    // Enter RSK amount
    await swapPage.EnterSendAmountOnSwap(page, '0.0000001')
    await page.waitForSelector('#selectedQuote_provider', {
      visible: true,
      timeout: 60000
    })
    expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'RBTC->SOV, Supporting source should be chosen!')
      .oneOf(['Sovyrn', 'Liquality'])

    // Click on Network speed + FEE
    await swapPage.ValidateNetworkFeeTab(page)
    // Click on Network speed + FEE & Validate
    const networkSpeedFee = await page.$eval('#details_header_chevron_down_icon', el => el.textContent)
    expect(networkSpeedFee).contain(fromAsset + ' Avg')

    // Review Button
    await swapPage.ClickSwapReviewButton(page)
    // Fees are high. Review transaction carefully.
    await swapPage.CheckFeesAreHigh(page)

    // SWAP SEND details validation
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain(fromAsset)

    const swapSendAmountInDollar = await swapPage.GetSwapSendAmountInDollar(page)
    expect(swapSendAmountInDollar.trim(), 'SWAP send amount not to be 0.00').not.contain('$00.00')

    const swapSendNetworkFeeValue = await swapPage.GetSwapSendNetworkFeeValue(page)
    expect(swapSendNetworkFeeValue.trim()).contain(fromAsset)

    const swapSendNetworkFeeInDollar = await swapPage.GetSwapSendNetworkFeeInDollar(page)
    expect(swapSendNetworkFeeInDollar.trim(),
      'Send network fee can not be $0.00').to.not.contain.oneOf(['$0.0000000', 'NaN', null])

    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain(fromAsset)

    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).to.not.contain.oneOf(['$00.00', 'NaN', null])

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(toAsset.coin)

    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim()).to.not.contain.oneOf(['$0.00', 'NaN', null])

    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).to.not.contain.oneOf(['$0.00', 'NaN', null])

    const receiveAccountFeesValue = await swapPage.GetSwapReceiveAccountFeeValue(page)
    expect(receiveAccountFeesValue.trim()).contain(toAsset.coin)

    // RATE
    await page.waitForSelector('#swap_review_rate_block', { visible: true })

    // Validate message
    await swapPage.ValidateMessage(page)
    // Check SWAP Initiate option has been enabled
    await page.waitForSelector('#initiate_swap_button:not([disabled])', { timeout: 5000 })
  })
})
