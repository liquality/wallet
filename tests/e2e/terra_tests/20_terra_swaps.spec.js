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

const swapPairMap = [
  {
    assert1: 'BTC',
    assert2: 'LUNA'
  }
]
describe('Terra swaps-[smoke,testnet]', async () => {
  swapPairMap.forEach(obj => {
    it(`SWAP (${obj.assert1}->${obj.assert2})`, async () => {
      const assert1 = obj.assert1
      const assert2 = obj.assert2

      browser = await puppeteer.launch(testUtil.getChromeOptions())
      page = await browser.newPage()
      await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 60000 })
      await homePage.ScrollToEndOfTerms(page)
      await homePage.ClickOnAcceptPrivacy(page)
      // Import wallet option
      await homePage.ClickOnImportWallet(page)
      // Enter seed words and submit
      await homePage.EnterSeedWords(page)
      // Create a password & submit
      await passwordPage.SubmitPasswordDetails(page, password)

      // overview page
      await overviewPage.HasOverviewPageLoaded(page)
      await overviewPage.CloseWatsNewModal(page)
      // Select testnet
      await overviewPage.SelectNetwork(page)
      // Click on BTC then click on SWAP button
      await overviewPage.SelectChain(page, assert1)
      await page.waitForSelector(`#${assert1}_swap_button`, { visible: true })
      await page.click(`#${assert1}_swap_button`)
      // Select PUSDT
      await swapPage.SelectSwapReceiveCoin(page)
      await page.waitForSelector('#search_for_a_currency', { visible: true })
      await page.type('#search_for_a_currency', assert2)
      await page.click(`#${assert2}`)
      await swapPage.ClickOnMax(page)
      // 1inch
      await page.waitForTimeout(10000)
      await page.waitForSelector('#selectedQuote_provider', { visible: true })
      try {
        expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
          `SWAP (${obj.assert1}->${obj.assert2}), Liquality should be chosen!`)
          .oneOf(['Liquality'])
      } catch (e) {
        await testUtil.takeScreenshot(page, `${obj.assert1}->${obj.assert2})-swap-issue`)
        expect(e, 'Liquality should be chosen').equals(null)
      }
      try {
        await page.close()
        await browser.close()
      } catch (e) {
        throw new Error(e)
      }
    })
  })
})
