const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const SendPage = require('../pages/SendPage')
const PasswordPage = require('../pages/PasswordPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const sendPage = new SendPage()

let browser, page

describe.only('Activity section["MAINNET"]', async () => {
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

  it('Activity filters', async () => {
    const assetName = 'BTC'
    const coinsToSend = '0.000001'

    await overviewPage.SelectAssetFromOverview(page, assetName)
    await page.waitForSelector(`#${assetName}_send_button`, { visible: true })
    await page.click(`#${assetName}_send_button`)

    // Enter send amount (or) coins
    await sendPage.EnterSendAmount(page, coinsToSend)

    // Send address
    await sendPage.EnterSendToAddress(page, 'tb1qjnrrgyzu2htfc3r8rklztvj0ak2a3v3jfuc6kl')

    // Click Send Review Button
    await page.waitForSelector('#send_review_button', { visible: true, timeout: 60000 })
    await page.click('#send_review_button')

    //Click send button
    await page.waitForSelector('#send_button_confirm')
    await page.click('#send_button_confirm')

    //Delete existing
    await overviewPage.deleteDirectory(page)
    
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './temp'});
    
    // Click export button
    await page.waitForSelector('.filter-export')
    await page.click('.filter-export')

    //Validate csv file data
    let header = await overviewPage.validateData()
    let headerType =  Object.keys(header)
    expect(headerType[0]).to.equals("ID")
    expect(headerType[1]).to.equals("Network")
    expect(headerType[2]).to.equals("Created")
    expect(headerType[3]).to.equals("From Asset")
    expect(headerType[4]).to.equals("To Asset")
    expect(headerType[5]).to.equals("Send Amount")
    expect(headerType[6]).to.equals("Receive Amount")
    expect(headerType[7]).to.equals("Swap Tx HASH")
    expect(headerType[8]).to.equals("Status")
    expect(headerType[9]).to.equals("Wallet ID")
 
    //Click filters dropdown
    await page.waitForSelector('.filter-action')
    await page.click('.filter-action')
          
    //Select type
    await page.click('.list-item-title') 

    Click start date-picker
    await page.click('.input-group')
    await page.click('.vdpCellContent')

    //click reset-button
    await page.click('.reset-action')

  })

})
