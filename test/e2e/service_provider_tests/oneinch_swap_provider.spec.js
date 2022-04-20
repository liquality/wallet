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

const swapPairMap = [
  {
    from: 'MATIC',
    to: 'PUSDT'
  },
  {
    from: 'MATIC',
    to: 'PWETH'
  },
  {
    from: 'PWETH',
    to: 'MATIC'
  }
  // {
  //   from: 'PWETH',
  //   to: 'PUSDT'
  // }
]

if (process.env.NODE_ENV === 'mainnet') {
  // Only works on Mainnet
  describe('1Inch Service Provider-["MAINNET"]', async () => {
    swapPairMap.forEach((obj) => {
      it(`SWAP (${obj.from}->${obj.to})`, async () => {
        const fromAsset = obj.from
        const toAsset = obj.to

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

        await overviewPage.SelectAssetFromOverview(page, fromAsset)
        await page.waitForSelector(`#${fromAsset}_swap_button`, { visible: true })
        await page.click(`#${fromAsset}_swap_button`)

        await swapPage.SelectSwapReceiveCoin(page)
        await page.waitForSelector('#search_for_a_currency', { visible: true })
        await page.type('#search_for_a_currency', toAsset)
        await page.click(`#${toAsset}`)
        await swapPage.ClickOnMin(page)
        // 1inch
        await page.waitForTimeout(10000)
        await page.waitForSelector('#selectedQuote_provider', { visible: true })
        try {
          expect(
            await page.$eval('#selectedQuote_provider', (el) => el.textContent),
            `${obj.from}->${obj.to}) swap, Oneinch V4 should be chosen!`
          ).equals('Oneinch V4')
        } catch (e) {
          await testUtil.takeScreenshot(page, '1inch-issue')
          expect(e, '1inch V4 should be chosen').equals(null)
        }
        // Validate available balance
        const { availableBalance } = await swapPage.getSwapAvailableBalance(page)
        expect(
          availableBalance,
          `${obj.from}->${obj.to}) swap, available balance should be greater than 0`
        ).to.be.above(0)

        // validate Send & To fiat values
        const { sendFromFiat, toFiat } = await swapPage.getSwapFiatValues(page)

        expect(
          sendFromFiat,
          `${obj.from}->${obj.to}) swap, Send fiat amount should be correct!`
        ).not.equals('$0.00')
        expect(
          sendFromFiat,
          `${obj.from}->${obj.to}) swap, To fiat amount should be correct!`
        ).not.equals('NaN')
        // validate Receive fiat amount
        expect(
          toFiat,
          `${obj.from}->${obj.to}) swap, Receive fiat amount should be correct!`
        ).not.equals('$0.00')
        expect(
          toFiat,
          `${obj.from}->${obj.to}) swap, Receive fiat amount should be correct!`
        ).not.equals('NaN')
      })
    })
    afterEach(async () => {
      await browser.close()
    })
  })
}
