const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const SeedWordsPage = require('../Pages/SeedWordsPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const seedWordsPage = new SeedWordsPage()

let browser, page

describe('Liquality wallet - Create wallet', async () => {
  const options = {
    slowMo: 20,
    headless: false,
    executablePath: process.env.PUPPETEER_EXEC_PATH, // set by docker container
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions-except=' + testUtil.extensionPathBuildPath,
      '--load-extension=' + testUtil.extensionPathBuildPath
    ]
  }

  beforeEach(async () => {
    browser = await puppeteer.launch(options)
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
    await homePage.ClickOnAcceptPrivacy(page)
  })

  afterEach(async () => {
    await browser.close()
  })

  it('Create a wallet with less that 8 or more characters password,validate button has been disabled', async () => {
    const password = '1234567'
    // Create new wallet
    await homePage.ClickOnCreateNewWallet(page)
    // Set password
    await passwordPage.EnterPasswordDetails(page, password, password)
    // confirm button has been disabled
    await passwordPage.ValidateSubmitPasswordDisabled(page)
  })
  it('Create a wallet with mismatch password, validate button has been disabled', async () => {
    // Create new wallet
    await homePage.ClickOnCreateNewWallet(page)
    // Set password
    await passwordPage.EnterPasswordDetails(page, '12345678', '1234567')
    // confirm button has been disabled
    await passwordPage.ValidateSubmitPasswordDisabled(page)
  })
  it('Create a new wallet with 12 words, validate overviewPage', async () => {
    const password = '123123123'
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
    await overviewPage.SelectNetwork(page, 'testnet')

    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the testnet asserts count
    const assetsCount = await overviewPage.GetTotalAssets(page)
    expect(assetsCount, 'Total assets in TESTNET should be 6').contain('6 Assets')
  })
})
