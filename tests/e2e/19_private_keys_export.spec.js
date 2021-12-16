const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const puppeteer = require('puppeteer')
const { expect } = require('chai')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page
const password = '123123123'

describe('Private key exports-[mainnet,smoke]', async () => {
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
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
  })
  afterEach(async () => {
    await browser.close()
  })

  async function clickExportKeyOption (page) {
    await overviewPage.ClickOnBurgerIcon(page)
    await page.waitForSelector('#export_privkey', { visible: true })
    await page.click('#export_privkey')
    await page.waitForSelector('#i_have_privacy_button', { visible: true })
    await page.click('#i_have_privacy_button')
    await page.waitForSelector('#password', { visible: true })
    await page.type('#password', password)
    await page.click('#checkbox')
    await page.click('#continue_button_to_see_seed_phrase')
  }

  it('BTC export private key', async () => {
    await overviewPage.SelectAssetFromOverview(page, 'BTC')
    await page.waitForSelector('#BTC_swap_button', { visible: true })
    // Click on Export Private Key
    await clickExportKeyOption(page)
    // Private key screen
    await page.waitForSelector('#private-key-textarea', { visible: true })
    const privateKeyTextArea = await page.$eval('#private-key-textarea', el => el.getAttribute('readonly'))
    const privateKey = await page.$eval('#private-key-textarea', el => el.value)
    expect(privateKeyTextArea).equals('readonly')
    expect(privateKey, 'Private key export value shouldn\'t be n/a')
      .to.not.contain.oneOf(['n/a', 'NaN', null])
    await page.click('#done_button')
    await page.waitForSelector('#BITCOIN')
  })
  it('LUNA export private key', async () => {
    await overviewPage.SelectAssetFromOverview(page, 'LUNA')
    // Click on Export Private Key
    await clickExportKeyOption(page)
    // Private key screen
    await page.waitForSelector('#private-key-textarea', { visible: true })
    const privateKeyTextArea = await page.$eval('#private-key-textarea', el => el.getAttribute('readonly'))
    const privateKey = await page.$eval('#private-key-textarea', el => el.value)
    expect(privateKeyTextArea).equals('readonly')
    expect(privateKey, 'Private key export value shouldn\'t be n/a')
      .to.not.contain.oneOf(['n/a', 'NaN', null])
  })
})
