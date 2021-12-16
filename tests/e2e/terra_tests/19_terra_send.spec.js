const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const SearchAssetPage = require('../../pages/SearchAssetPage')
const SendPage = require('../../pages/SendPage')
const TransactionDetailsPage = require('../../pages/TransactionDetailsPage')
const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const searchAssetPage = new SearchAssetPage()
const sendPage = new SendPage()
const transactionDetailsPage = new TransactionDetailsPage()

let browser, page
const password = '123123123'

// https://linear.app/liquality/issue/LIQ-358/exploratory-report-on-terra
describe('Terra SEND feature[smoke,testnet]', async () => {
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
    await page.close()
  })
  it('Send LUNA', async () => {
    const assertName = 'LUNA'
    const coinsToSend = '1'
    const sendAddress = 'terra1mecrspqx809t7ah9dyhc3cdgpylxvrq5k2fak5'
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ClickSend(page)
    // Search for coin & select coin
    await searchAssetPage.SearchForAnAsset(page, assertName)

    // Enter send amount (or) coins
    await sendPage.EnterSendAmount(page, coinsToSend)
    // Send address
    await sendPage.EnterSendToAddress(page, sendAddress)
    await page.waitForTimeout(10000)
    // Click Review Button
    await sendPage.ClickSendReview(page)
    // Confirm SEND
    await sendPage.ConfirmSend(page)
    // Transaction details page validations
    const domain = 'https://finder.terra.money/bombay-12'
    await transactionDetailsPage.ValidateSentAmount(page, '1 LUNA')
    await transactionDetailsPage.ValidateSentToLink(page, `${domain}/address`)
    await transactionDetailsPage.ValidateNetworkSpeedFee(page)
    await transactionDetailsPage.ValidateTime(page)
    await transactionDetailsPage.ValidateStatus(page)
    await transactionDetailsPage.ValidateTransactionIDLink(page, `${domain}/tx`)
  })
})
