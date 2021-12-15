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

describe('RBTC->BTC swap-["smoke"]', async () => {
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
    await overviewPage.SelectNetwork(page)
  })
  after(async () => {
    await page.close()
  })

  it('SWAP RBTC to BTC - liquality', async () => {
    const fromAsset = 'RBTC'
    const toAsset = 'BTC'

    // Click fromAsset
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector('#' + fromAsset + '_swap_button', { visible: true })
    await page.click('#' + fromAsset + '_swap_button')
    console.log(`User clicked on ${fromAsset} SWAP button`)
    await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
    console.log('SWAP screen has been displayed with send amount input field')

    // Select toAsset
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector(`#${toAsset}`, { timeout: 120000, visible: true })
    await page.click(`#${toAsset}`)
    console.log(`User selected ${toAsset} as 2nd pair for swap`)

    // Update the SWAP value to 0.0004
    await swapPage.EnterSendAmountOnSwap(page, '0.00001')
    try {
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'rbtc-btc-quote-issue')
      expect(e, 'BTC->RBTC failed, quote not displayed.....').equals(null)
    }

    expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'BTC->RBTC,Liquality swap Provider!!').oneOf(['Liquality'])

    // Click on SWAP Review button
    await swapPage.ClickSwapReviewButton(page)
    await page.waitForTimeout(10000)

    // SWAP SEND details validation
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain(fromAsset)
    console.log(('SEND Swap value: ' + sendAmountValue))
    // Send confirm USD value
    const swapSendAmountInDollar = await swapPage.GetSwapSendAmountInDollar(page)
    expect(swapSendAmountInDollar.trim(), `Send Network fee should not be $0.00 for ${fromAsset}`)
      .not.equals('$0.00')
    console.log(('User SEND Swap value in USD: ' + swapSendAmountInDollar))
    // Send Network Fee
    const swapSendNetworkFeeValue = await swapPage.GetSwapSendNetworkFeeValue(page)
    expect(swapSendNetworkFeeValue.trim()).contain('RBTC')
    console.log(('User SEND Swap Network Fee value: ' + swapSendNetworkFeeValue))
    // Send Network Fee in USD
    const swapSendNetworkFeeInDollar = await swapPage.GetSwapSendNetworkFeeInDollar(page)
    expect(swapSendNetworkFeeInDollar.trim(), `Send ${fromAsset} network fee can not be $0.00`)
      .not.contain('$0.00')
    console.log(('User SEND Swap Network Fee value in USD: ' + swapSendNetworkFeeInDollar))
    // Send Account+FEES
    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain('RBTC')
    console.log(('User SEND Account+FEES value: ' + swapSendAccountFeesValue))
    // Send Accounts+FEES in USD
    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).not.contain('$00.00')
    console.log(('User SEND Account+FEES value in USD: ' + swapSendAccountFeesInDollar))

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(toAsset)

    // Receive fiat amount in $
    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim(), 'Swap receive fiat amount should not be 0.00')
      .not.contain('$0.00')
    expect(receiveAmountInDollar.trim()).not.contain('NaN')
    // Receive Network Fee
    const receiveNetworkFeeValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveNetworkFeeValue.trim()).contain(toAsset)
    // Receive Network Fee fiat total
    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('$0.00')
    expect(receiveNetworkFeeInDollar.trim()).not.contain('NaN')
    // Receive Amount+Fees fee
    const receiveAccountFeesValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveAccountFeesValue.trim()).contain(toAsset)
    // Receive Amount+Fees fiat value
    const receiveAccountFeesInDollar = await swapPage.GetSwapReceiveNetworkInDollar(page)
    expect(receiveAccountFeesInDollar.trim(), `Receive Network fee should not be $0.00 for ${toAsset}`)
      .not.contain('$0.00')
    expect(receiveAccountFeesInDollar.trim()).not.contain('NaN')
    // RATE
    await page.waitForSelector('#swap_review_rate_block')
  })
})
