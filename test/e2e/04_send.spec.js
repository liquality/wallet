const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const SearchAssetPage = require('../pages/SearchAssetPage')
const SendPage = require('../pages/SendPage')
const TransactionDetailsPage = require('../pages/TransactionDetailsPage')
const expect = require('chai').expect

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const searchAssetPage = new SearchAssetPage()
const sendPage = new SendPage()
const transactionDetailsPage = new TransactionDetailsPage()

const puppeteer = require('puppeteer')
let browser
let page

const password = '123123123'

describe('SEND feature["TESTNET"]', async () => {
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
    // Select testnet
    await overviewPage.SelectNetwork(page)
  })
  afterEach(async () => {
    await browser.close()
  })

  it('Send BTC to another Wrong address. check Review option has been disabled', async () => {
    const assetName = 'BTC'
    const coinsToSend = '0.000001'

    // check Send & Swap & Receive options have been displayed
    await overviewPage.ClickSend(page)
    // Search for coin & select coin
    await searchAssetPage.SearchForAnAsset(page, assetName)

    // Enter send amount (or) coins
    await sendPage.EnterSendAmount(page, coinsToSend)
    // Send address
    await sendPage.EnterSendToAddress(page, '0x172E90C757c66f0d93E96165FDb7B3c03337Be6A')
    // Check Address format error
    await sendPage.ValidateAddressFormatError(page, 'Wrong format. Please check the address.')
    // Check Send Review option has been disabled
    await sendPage.HasReviewButtonDisabled(page)
  })
  it('Send BTC to another address,Lower amount. This exceeds available balance.', async () => {
    const assetName = 'BTC'
    const coinsToSend = '10'
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ClickSend(page)
    // Search for coin & select coin
    await searchAssetPage.SearchForAnAsset(page, assetName)

    // Enter send amount (or) coins
    await sendPage.EnterSendAmount(page, coinsToSend)
    // Send address
    await sendPage.EnterSendToAddress(page, '0x32Be343B94f860124dC4fEe278FDCBD38C102D88')
    // Check Send Limit format error
    await sendPage.ValidateAmountLimitError(page, 'Lower amount. This exceeds available balance.')
    // Check Send Review option has been disabled
    await sendPage.HasReviewButtonDisabled(page)
  })
  it('Send BNB to another BNB wallet["PULL_REQUEST_TEST"]', async () => {
    const assetName = 'BNB'
    const coinsToSend = '0.0000001'
    await overviewPage.SelectAssetFromOverview(page, assetName)
    await page.waitForSelector(`#${assetName}_send_button`, { visible: true })
    await page.click(`#${assetName}_send_button`)
    // Enter send amount (or) coins
    await sendPage.EnterSendAmount(page, coinsToSend)
    // Send address
    await sendPage.EnterSendToAddress(page, '0x0c62B13f8116eBA444DeFdE842aBd7d1f68F964f')
    // Click Review Button
    await sendPage.ClickSendReview(page)
    // Confirm SEND
    await sendPage.ConfirmSend(page)
    // Transaction details page validations
    const domain = 'https://testnet.bscscan.com'
    await transactionDetailsPage.ValidateSentAmount(page, '0 BNB')
    await transactionDetailsPage.ValidateSentToLink(page, `${domain}/address`)
    await transactionDetailsPage.ValidateNetworkSpeedFee(page)
    await transactionDetailsPage.ValidateTime(page)
    await transactionDetailsPage.ValidateStatus(page)
    await transactionDetailsPage.ValidateTransactionIDLink(page, `${domain}/tx`)
  })
  it('Send RBTC to another RBTC wallet["PULL_REQUEST_TEST"]', async () => {
    const assetName = 'RBTC'
    const coinsToSend = '0.0000001'
    await overviewPage.SelectAssetFromOverview(page, assetName)
    await page.waitForSelector(`#${assetName}_send_button`, { visible: true })
    await page.click(`#${assetName}_send_button`)
    // Enter send amount (or) coins
    await sendPage.EnterSendAmount(page, coinsToSend)
    // Send address
    await sendPage.EnterSendToAddress(page, '0x172E90C757c66f0D93e96165FdB7b3C03337Be6a')
    // Click Send Review Button
    await page.waitForSelector('#send_review_button', { visible: true, timeout: 60000 })
    try {
      await page.click('#send_review_button', { clickCount: 5 })
      await page.waitForSelector('#send_button_confirm', { visible: true, timeout: 60000 })
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        await page.$eval('#send_review_button', el => el.click())
      }
    }
    // Confirm SEND & validate send fiat details
    await page.waitForSelector('#send_button_confirm', { visible: true, timeout: 60000 })
    const sentFiatAmount = await page.$eval('#send_value_in_fiat', el => el.innerText)
    expect(sentFiatAmount.toString().trim().replace('$', '')).not.equals('0.00')

    const sentNetworkFiatAmount = await page.$eval('#send_network_fee_in_fiat', el => el.innerText)
    expect(sentNetworkFiatAmount.toString().trim().replace('$', '')).not.equals('0.00')

    const totalSendAmountFiat = await page.$eval('#total_to_send_in_fiat', el => el.innerText)
    expect(totalSendAmountFiat.toString().trim().replace('$', '')).not.equals('0.00')

    await page.click('#send_button_confirm')
    await page.waitForSelector('#SEND_RBTC_RBTC', { visible: true, timeout: 60000 })
    await page.click('#SEND_RBTC_RBTC')

    // Transaction details page validations
    await page.waitForSelector('#transaction_details_status_number_of_confirmations', { visible: true, timeout: 180000 })
    const sendStatus = await page.$eval('#transaction_details_status_and_confirmations', el => el.innerText)
    expect(sendStatus).contains('Completed')
  })
  it('ETH Send Max value check against Available Balance', async () => {
    const assetName = 'ETH'
    await overviewPage.SelectAssetFromOverview(page, assetName)
    await page.waitForSelector(`#${assetName}_send_button`, { visible: true })
    await page.click(`#${assetName}_send_button`)
    // Click on Max
    await sendPage.SelectMaxSend(page)
    // Validate Available amount vs send amount
    const sendAmount = await sendPage.GetSendAmount(page)
    const availableAmount = await sendPage.GetSendAvailableBalance(page)
    expect(availableAmount,
      'Available balance and Max send amount are equal for ethereum').contains(sendAmount)
  })
})
