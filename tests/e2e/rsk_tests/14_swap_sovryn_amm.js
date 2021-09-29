const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../Pages/OverviewPage')
const HomePage = require('../../Pages/HomePage')
const PasswordPage = require('../../Pages/PasswordPage')
const SwapPage = require('../../Pages/SwapPage')
const expect = require('chai').expect
const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()

let browser, page
const password = '123123123'

describe('SWAP Sovryn AMM service Provider', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
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
    const asset1 = 'RBTC'
    const asset2 = 'SOV'

    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.CloseWatsNewModal(page)
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on ETH then click on SWAP button
    await overviewPage.SelectChain(page, asset1)
    await page.waitForSelector(`#${asset1}_swap_button`, { visible: true })
    await page.click(`#${asset1}_swap_button`)
    // Validate min SEND amount from text field & check Min is Active
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'ETH to DAI SWAP min value not set in input').not.equals('0.0000')
    await swapPage.ClickOnMin(page)
    // Select 2nd Pair (DAI)
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector('#RSK', { visible: true })
    await page.click('#RSK')
    await page.waitForSelector(`#${asset2}`, { visible: true })
    await page.click(`#${asset2}`)
    // Enter RSK amount
    await swapPage.EnterSendAmountOnSwap(page, '0.0000001')
    await page.waitForSelector('#selectedQuote_provider', {
      visible: true,
      timeout: 60000
    })
    await page.waitForTimeout(10000)
    expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'RBTC->SOV, Supporting source should be chosen!')
      .oneOf(['Sovyrn'])

    // Click on Network speed + FEE
    await swapPage.ValidateNetworkFeeTab(page)
    // Click on Network speed + FEE & Validate
    const networkSpeedFee = await page.$eval('#details_header_chevron_down_icon', el => el.textContent)
    expect(networkSpeedFee).contain(asset1 + ' Avg')

    // Review Button
    await swapPage.ClickSwapReviewButton(page)
    // Fees are high. Review transaction carefully.
    await swapPage.CheckFeesAreHigh(page)

    // SWAP SEND details validation
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain(asset1)

    const swapSendAmountInDollar = await swapPage.GetSwapSendAmountInDollar(page)
    expect(swapSendAmountInDollar.trim(), 'SWAP send amount not to be 0.00').not.contain('$00.00')

    const swapSendNetworkFeeValue = await swapPage.GetSwapSendNetworkFeeValue(page)
    expect(swapSendNetworkFeeValue.trim()).contain(asset1)

    const swapSendNetworkFeeInDollar = await swapPage.GetSwapSendNetworkFeeInDollar(page)
    expect(swapSendNetworkFeeInDollar.trim(),
      'Send network fee can not be $0.00').not.contain('$0.0000000')
    expect(swapSendNetworkFeeInDollar.trim(),
      'Send network fee can not be $0.00').not.contain('NaN')

    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain(asset1)

    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).not.contain('$00.00')
    expect(swapSendAccountFeesInDollar.trim()).not.contain('NaN')

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(asset2)

    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim()).not.contain('$00.00')
    expect(receiveAmountInDollar.trim()).not.contain('NaN')

    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('$0.00')
    expect(receiveNetworkFeeInDollar.trim()).not.contain('NaN')

    const receiveAccountFeesValue = await swapPage.GetSwapReceiveAccountFeeValue(page)
    expect(receiveAccountFeesValue.trim()).contain(asset2)

    // RATE
    await page.waitForSelector('#swap_review_rate_block')

    // Validate message
    await swapPage.ValidateMessage(page)
    // Check SWAP Initiate option has been enabled
    await page.waitForSelector('#initiate_swap_button:not([disabled])', { timeout: 5000 })
  })
})
