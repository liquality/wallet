const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const SeedWordsPage = require('../../pages/SeedWordsPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const seedWordsPage = new SeedWordsPage()

let browser
let page = []

describe('Buy Crypto onRamper ["MAINNET"]', async () => {
    describe('Create new wallet & Buy Crypto options validation', async () => {
      beforeEach(async () => {
        browser = await puppeteer.launch(testUtil.getChromeOptions())
        page = await browser.newPage()
        await page.setDefaultNavigationTimeout(0)
        await page.goto(testUtil.extensionRootUrl, { waitUntil: 'networkidle2' })
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
        await overviewPage.CloseWhatsNewModal(page)
      })
      afterEach(async () => {
        await browser.close()
      })
      it('Buy Crypto from overview screen["PULL_REQUEST_TEST"]', async () => {
        // Check Buy crypto options from overview screen
        const buyCryptoModalData = await page.waitForSelector('#buy-crypto-from-overview-screen', {
          visible: true
        })
        expect(buyCryptoModalData).to.exist
        await buyCryptoModalData.click()
        const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button#open_transak_tab_btn'), element => element.textContent));
        await page.$x("//button[contains(., 'Continue with Onramper')]")
        expect(buttons).to.exist
      })
      it('Buy Crypto from EmptyActivity screen["PULL_REQUEST_TEST"]', async () => {
        await page.click('#activity_tab')
        const buyCryptoModalData = await page.waitForSelector('#buy_crypto_button', {
          visible: true
        })
        expect(buyCryptoModalData).to.exist
        await buyCryptoModalData.click()
        const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button#open_transak_tab_btn'), element => element.textContent));
        await page.$x("//button[contains(., 'Continue with Onramper')]")
        expect(buttons).to.exist
      })
      it('Buy Crypto from ETH asset screen["PULL_REQUEST_TEST"]', async () => {
        await page.click("#ETHEREUM")
        await page.waitForSelector('#ETH')
        await page.click('#ETH')
        const buyCryptoModalData = await page.waitForSelector('#buy_crypto_button', {
          visible: true
        })
        expect(buyCryptoModalData).to.exist
        await buyCryptoModalData.click()
        const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button#open_transak_tab_btn'), element => element.textContent));
        await page.$x("//button[contains(., 'Continue with Onramper')]")
        expect(buttons).to.exist
      })
      it('Buy Crypto from ETH Receive screen["PULL_REQUEST_TEST"]', async () => {
        await page.click("#ETHEREUM")
        await page.waitForSelector('#ETH')
        await page.click('#ETH')
        await page.waitForSelector('#ETH_receive_button',{ visible: true })
        await page.click('#ETH_receive_button')
        const buyCryptoModalData = await page.waitForSelector('#buy_crypto_button', {
          visible: true
        })
        expect(buyCryptoModalData).to.exist
        await buyCryptoModalData.click()
        const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button#open_transak_tab_btn'), element => element.textContent));
        await page.$x("//button[contains(., 'Continue with Onramper')]")
        expect(buttons).to.exist
      })
    })
  })
