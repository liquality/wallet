const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const expect = require('chai').expect
const chalk = require('chalk')

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page
const password = '123123123'

describe('Hamburger menu options [Wallet] - ["mainnet"]', async () => {
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

  it('should be use backup seed feature', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page, null)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page, 'testnet')
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)

    // Check the currency
    expect(await overviewPage.GetCurrency(page),
      'Wallet stats has currency should be USD').contain('USD')

    // Click on Backup seed from Burger Icon menu
    await page.waitForSelector('#burger_icon_menu', { visible: true })
    await page.click('#burger_icon_menu')
    await page.waitForSelector('#backup_seed', { visible: true })
    await page.click('#backup_seed')
    console.log(chalk.green('User clicked on Backup Seed option'))
    await page.waitForSelector('#i_have_privacy_button', { visible: true })
    expect(await page.$eval('#show_seed_phrase', (el) => el.textContent)).equals('Show Seed Phrase?')
    expect(await page.$eval('#show_seed_phrase_warning', (el) => el.textContent))
      .equals('Anyone who has this seed phrase can steal your funds!')
    await page.click('#i_have_privacy_button')
    await page.waitForSelector('#password', { visible: true })
    await page.type('#password', password)
    await page.click('#checkbox')
    await page.waitForSelector('#continue_button_to_see_seed_phrase:not([disabled])')
    await page.click('#continue_button_to_see_seed_phrase')
    await page.waitForSelector('#i_saved_the_seed:not([disabled])', { visible: true })

    const result = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('#seed_word_mouse_hover'))
      return elements.map(element => {
        return element.innerText
      })
    })

    expect(result.length).equals(12)
    for (const word of result) {
      expect(word).not.equals(undefined)
      expect(word).not.equals(null)
    }

    await page.click('#i_saved_the_seed')
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
  })
})
