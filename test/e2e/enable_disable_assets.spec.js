const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const SeedWordsPage = require('../pages/SeedWordsPage')
const ReceivePage = require('../pages/ReceivePage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const seedWordsPage = new SeedWordsPage()
const receivePage = new ReceivePage()

let browser, page

describe('Enable and disable asset ["MAINNET","PULL_REQUEST_TEST"]', async () => {
  describe('Create a wallet', async () => {
    beforeEach(async () => {
      browser = await puppeteer.launch(testUtil.getChromeOptions())
      page = await browser.newPage()
      await page.setDefaultNavigationTimeout(0)
      await page.goto(testUtil.extensionRootUrl, { waitUntil: 'networkidle2' })
    })
    afterEach(async () => {
      await browser.close()
    })
    it('Create a new wallet & enable and disable assets, validate against overviewPage', async () => {
      // Create new wallet
      await homePage.ClickOnCreateNewWallet(page)
      // Terms & conditions
      await homePage.ScrollToEndOfTerms(page)
      await homePage.ClickOnAcceptPrivacy(page)
      // Unlocking wallet...
      const seed1 = (await seedWordsPage.GetBackupSeedWords(page)).seed1
      const seed5 = (await seedWordsPage.GetBackupSeedWords(page)).seed5
      const seed12 = (await seedWordsPage.GetBackupSeedWords(page)).seed12
      // Click Next
      await seedWordsPage.ClickOnWalletNextButton(page)
      // Enter seed1,5,.12
      await seedWordsPage.EnterSeedWords(page, seed1, seed5, seed12)
      await seedWordsPage.ClickContinueButton(page)
      // Set password & click next
      await passwordPage.SubmitPasswordDetails(page)
      // overview page
      await overviewPage.HasOverviewPageLoaded(page)
      await overviewPage.CloseWhatsNewModal(page)
      // check Send & Swap & Receive options have been displayed
      await overviewPage.ValidateSendSwipeReceiveOptions(page)
      const totalAssetsBeforeDisable = await overviewPage.getTotalAssetsFromOverview(page)
      console.log('Total assets before disable: ', totalAssetsBeforeDisable)
      // click on manage assets
      await overviewPage.ClickOnManageAssets(page)
      // Disable BTC chain assets
      await page.waitForSelector('#BTC_toggle_button')
      await page.click('#BTC_toggle_button')
      await page.click('#previous_nav_bar')
      const totalAssetsAfterDisable = await overviewPage.getTotalAssetsFromOverview(page)
      console.log('Total assets after disable: ', totalAssetsAfterDisable)
      expect(totalAssetsAfterDisable).lt(totalAssetsBeforeDisable)
    })
  })
})
