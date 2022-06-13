const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page

describe('Activity section["MAINNET"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'networkidle2' })

    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)

    // Enter seed words and submit
    await homePage.EnterSeedWords(page)

    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page)

    // overview page
    await overviewPage.CloseWhatsNewModal(page)
    await overviewPage.HasOverviewPageLoaded(page)

  })
  afterEach(async () => {
    await browser.close()
  })

  it('Filters - Daterange & Type', async () => {
    // Click Activity tab on overview page
    await overviewPage.ClickActivityTab(page)

    //Click filters dropdown
    await page.waitForSelector('.filter-action')
    await page.click('.filter-action')
   
    //Click start date-picker
    await page.click('.form-control form-control-sm')
    await page.waitForSelector('.vdpArrow vdpArrowPrev', {
        visible: true,
        timeout: 60000
      })
    await page.click('.vdpArrow vdpArrowPrev')
    await page.click('.vdpCellContent')

    //Click end date-picker
    await page.click('.form-control form-control-sm')
    await page.click('.vdpCellContent')

    //Select type
    await page.click('.list-item-title')
  })

  it('Export transaction details', async () => {
    
    // Click Activity tab on overview page
    await overviewPage.ClickActivityTab(page)
   
    //Set download directory
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './Downloads'})

    // Click export button
    await page.waitForSelector('.filter-export')
    await page.click('.filter-export')
    await page.waitFor(60000)

    //Find file name, extra file from file system into memory
    await overviewPage.ExtractFile(page)

  })

})
