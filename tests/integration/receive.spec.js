const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const SeedWordsPage = require('../Pages/SeedWordsPage')
const ReceivePage = require('../Pages/ReceivePage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const seedWordsPage = new SeedWordsPage()
const receivePage = new ReceivePage()

let browser, page
const password = '123123123'

describe('Liquality wallet- Receive-["mainnet"]', async () => {
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

  it('Create a new wallet and check Receive for BTC', async () => {
    // Create new wallet
    await homePage.ClickOnCreateNewWallet(page)
    // Set password
    await passwordPage.SubmitPasswordDetails(page, password)
    // Unlocking wallet...
    const seed1 = (await seedWordsPage.GetBackupSeedWords(page)).seed1
    const seed5 = (await seedWordsPage.GetBackupSeedWords(page)).seed5
    const seed12 = (await seedWordsPage.GetBackupSeedWords(page)).seed12
    // Click Next
    await seedWordsPage.ClickOnWalletNextButton(page)
    // Enter seed1,5,.12
    await seedWordsPage.EnterSeedWords(page, seed1, seed5, seed12)
    // continue
    await seedWordsPage.ClickContinueButton(page)

    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select network
    if (process.env.NODE_ENV !== 'mainnet') {
      await overviewPage.SelectNetwork(page, 'testnet')
    } else {
      await overviewPage.SelectNetwork(page, 'mainnet')
    }
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the testnet asserts count
    const assetsCount = await overviewPage.GetTotalAssets(page)
    expect(assetsCount, 'Total assets in TESTNET should be 7').contain('7 Assets')

    // Select BTC
    await overviewPage.SelectChain(page, 'BITCOIN')
    await overviewPage.ClickChainReceive(page, 'BTC')
    // Receive validations
    await receivePage.HasQRCodeDisplayed(page)
    await receivePage.CheckReceiveAddresses(page)
    await receivePage.ClickCopyAddress(page)
    await receivePage.ClickDone(page)
    await overviewPage.CheckAssertOverviewDetails(page, 'BTC')
  })
  it('Import wallet and check Receive for ETH', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select Network
    if (process.env.NODE_ENV !== 'mainnet') {
      await overviewPage.SelectNetwork(page, 'testnet')
    } else {
      await overviewPage.SelectNetwork(page, 'mainnet')
    }

    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // Select ETH
    await overviewPage.SelectChain(page, 'ETHEREUM')
    await overviewPage.ClickChainReceive(page, 'ETH')
    // Receive validations
    await receivePage.HasQRCodeDisplayed(page)
    await receivePage.CheckReceiveURL(page)
    await receivePage.CheckReceiveAddresses(page)
    await receivePage.ClickCopyAddress(page)
    await receivePage.ClickDone(page)
    await overviewPage.CheckAssertOverviewDetails(page, 'ETH')
  })
  it('Import wallet and check Receive for BNB', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select Network
    if (process.env.NODE_ENV !== 'mainnet') {
      await overviewPage.SelectNetwork(page, 'testnet')
    } else {
      await overviewPage.SelectNetwork(page, 'mainnet')
    }

    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // Select BNB
    await overviewPage.SelectChain(page, 'BSC')
    await overviewPage.ClickChainReceive(page, 'BNB')
    // Receive validations
    await receivePage.HasQRCodeDisplayed(page)
    await receivePage.CheckReceiveURL(page)
    await receivePage.CheckReceiveAddresses(page)
    await receivePage.ClickCopyAddress(page)
    await receivePage.ClickDone(page)
    await overviewPage.CheckAssertOverviewDetails(page, 'BNB')
  })
  it('Import wallet and check Receive for NEAR', async () => {
    const nearPlatform = 'NEAR'

    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select Network
    if (process.env.NODE_ENV !== 'mainnet') {
      await overviewPage.SelectNetwork(page, 'testnet')
    } else {
      await overviewPage.SelectNetwork(page, 'mainnet')
    }

    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // Select NEAR
    await overviewPage.SelectChain(page, nearPlatform)
    await overviewPage.ClickChainReceive(page, nearPlatform)
    // Receive validations
    const yourCurrentAddress = await page.$eval('#your_current_asset_address', (el) => el.textContent)
    expect(yourCurrentAddress).contains(nearPlatform)
    await receivePage.HasQRCodeDisplayed(page)
    await receivePage.CheckReceiveURL(page)
    await receivePage.CheckReceiveAddresses(page)
    await receivePage.ClickCopyAddress(page)
    await receivePage.ClickDone(page)
    // After done
    await overviewPage.CheckAssertOverviewDetails(page, nearPlatform)
  })
})
