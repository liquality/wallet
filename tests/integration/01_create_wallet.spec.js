const TestUtil = require('../utils/TestUtils')
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

describe('Create wallet-["mainnet"]', async () => {
  before(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
  })

  after(async () => {
    try {
      console.log('Cleaning up instances')
      await page.close()
      await browser.close()
    } catch (e) {
      console.log('Cannot cleanup instances')
    }
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
    const passwordInput = await page.$('#password')
    const confirmPasswordInput = await page.$('#confirmPassword')
    await passwordInput.click({ clickCount: 3 })
    await confirmPasswordInput.click({ clickCount: 3 })
    // Set password
    await passwordPage.EnterPasswordDetails(page, 'testwallet1', 'testwallet2')
    // check the password error message
    await page.waitForSelector('#password_match_error', { visible: true })
    expect(await page.$eval('#password_match_error', (el) => el.textContent))
      .contains('Passwords don\'t match.')
    // confirm button has been disabled
    await passwordPage.ValidateSubmitPasswordDisabled(page)
  })
  it('Create a new wallet with 12 words, validate overviewPage address for ETH and RSK', async () => {
    const password = '123123123'

    const passwordInput = await page.$('#password')
    const confirmPasswordInput = await page.$('#confirmPassword')
    await passwordInput.click({ clickCount: 3 })
    await confirmPasswordInput.click({ clickCount: 3 })
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
    await overviewPage.CloseWatsNewModal(page)
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the testnet asserts count
    const assetsCount = await overviewPage.GetTotalAssets(page)
    expect(assetsCount, 'Total assets in TESTNET should be 7').contain('7 Assets')
  })
})
