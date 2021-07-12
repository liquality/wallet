const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const SearchAssetPage = require('../Pages/SearchAssetPage')
const SwapPage = require('../Pages/SwapPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const searchAssetPage = new SearchAssetPage()
const swapPage = new SwapPage()

let browser, page
const password = '123123123'

describe('Liquality wallet SWIPE feature', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
    await homePage.ClickOnAcceptPrivacy(page)
  })

  afterEach(async () => {
    if (browser !== undefined) {
      await browser.close()
    }
  })

  it('SWAP BTC to ETH', async () => {
    const asset1 = 'BTC'
    const asset2 = 'ETH'

    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page, 'testnet')
    // Click on Swipe
    await overviewPage.ClickSwipe(page)

    // SEND from assert (BTC)
    await searchAssetPage.SearchForAnAsset(page, asset1)
    await swapPage.ClickOnMin(page)
    // Click on Network speed + FEE
    await swapPage.ValidateNetworkFeeTab(page)
    // Review
    await swapPage.ClickSwapReviewButton(page)

    // SWAP SEND details validation
    await page.waitForTimeout(3000)
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain(asset1)

    const swapSendAmountInDollar = await swapPage.GetSwapSendAmountInDollar(page)
    expect(swapSendAmountInDollar.trim(), 'SWAP send amount not to be 0.00').not.contain('$00.00')

    const swapSendNetworkFeeValue = await swapPage.GetSwapSendNetworkFeeValue(page)
    expect(swapSendNetworkFeeValue.trim()).contain(asset1)

    const swapSendNetworkFeeInDollar = await swapPage.GetSwapSendNetworkFeeInDollar(page)
    expect(swapSendNetworkFeeInDollar.trim(), 'Send network fee can not be $0.00').not.contain('$0.00')

    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain(asset1)

    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).not.contain('$00.00')

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(asset2)

    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim()).not.contain('$00.00')

    const receiveNetworkFeeValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveNetworkFeeValue.trim()).contain(asset2)

    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('$0.00')

    const receiveAccountFeesValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveAccountFeesValue.trim()).contain(asset2)

    const receiveAccountFeesInDollar = await swapPage.GetSwapReceiveNetworkInDollar(page)
    expect(receiveAccountFeesInDollar.trim()).not.contain('$00.00')
    // Validate message
    await swapPage.ValidateMessage(page)

    // TODO: Click on swap confirm step
    await swapPage.ClickInitiateSwapButton(page)
  })
  it('SWAP (BTC),Please increase amount. It is below minimum.', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page, 'testnet')
    // Click on Swipe
    await overviewPage.ClickSwipe(page)

    // SEND from assert (BTC)
    await searchAssetPage.SearchForAnAsset(page, 'BTC')
    // Enter 0
    await page.waitForTimeout(20000)
    await swapPage.EnterSendAmountOnSwap(page, '0')
    expect(await swapPage.GetSwapSendErrors(page))
      .contains('Please increase amount. It is below minimum.')
    // Check review button has been disabled
    await swapPage.HasReviewButtonDisabled(page)
  })
  it('SWAP(BTC),Lower amount. This exceeds available balance.', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page, 'testnet')
    // Click on Swipe
    await overviewPage.ClickSwipe(page)

    // SEND from assert (BTC)
    await searchAssetPage.SearchForAnAsset(page, 'BTC')
    // Enter 1000
    await swapPage.EnterSendAmountOnSwap(page, '1000')
    expect(await swapPage.GetSwapSendErrors(page)).contains('Lower amount. This exceeds available balance.')
    // Check review button has been disabled
    await swapPage.HasReviewButtonDisabled(page)
  })
})
