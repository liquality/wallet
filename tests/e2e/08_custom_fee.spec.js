const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const SendPage = require('../pages/SendPage')
const TransactionDetailsPage = require('../pages/TransactionDetailsPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const sendPage = new SendPage()
const transactionDetailsPage = new TransactionDetailsPage()

let browser, page
const password = '123123123'

describe('Custom fee feature["testnet"]', async () => {
  const coinName = 'SOV'
  const coinsToSend = '0.001'

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
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on bitcoin & Click on Send option
    await overviewPage.SelectAssetFromOverview(page, coinName)
    await page.waitForSelector(`#${coinName}_send_button`, { visible: true })
    // Check view explorer
    await overviewPage.HasViewExplorerDisplayed(page, coinName)
    await page.click(`#${coinName}_send_button`)
    // Enter send amount (or) coins
    await sendPage.EnterSendAmount(page, coinsToSend)
    // Send address to another SOV
    await sendPage.EnterSendToAddress(page, '0x9D0023bD55AB3647F6c591dA6D46E5A6128D33D1')
  })

  it('Send SOV to another SOV with custom fee (Fast)-[smoke]', async () => {
    // Network speed
    await sendPage.ClickNetworkSpeedFee(page)
    expect(await page.$eval('#average', (el) => el.getAttribute('class')),
      'Avg network speed/fee by default selected')
    expect(await page.$eval('#average', (el) => el.getAttribute('class')), 'Avg network speed/fee has tooltip')
      .contains('has-tooltip')
    // Check Network Speed/FEE
    const avgNetworkSpeedFee = await sendPage.GetNetworkSpeedFee(page)
    expect(avgNetworkSpeedFee, 'SOV->SOV send Network Fee should be 0.000001 RBTC')
      .contains('0.000001 RBTC')

    // Select Custom network speed fee
    await page.click('#custom_network_speed_button')
    // By default Average is active & has tool tip
    await page.waitForSelector('#average', { visible: true })
    expect(await page.$eval('#average', (el) => el.getAttribute('class')), 'Avg network speed/fee by default selected')
      .contains('active')

    // Choose Fast Network speed
    await page.click('#fast')
    expect(await page.$eval('#fast', (el) => el.getAttribute('class')), 'Fast network speed/fee selected')
      .contains('active')
    // #fast > div.custom-fee-amount
    const fastFeeAmount = await page.$eval('#fast > div.custom-fee-amount', el => el.textContent.trim())
    const fastFeeFiatAmount = await page.$eval('#fast > div.custom-fee-fiat', el => el.textContent.trim())
    expect(fastFeeFiatAmount).not.contains('0.00')
    // Apply Custom fee button
    await page.click('#custom_fee_apply_button')
    await page.waitForSelector('#send_network_speed', { visible: true })
    await page.click('#send_network_speed')
    expect(await page.$eval('#fast', (el) => el.getAttribute('class')), 'Fast network speed/fee selected').contains('active')
    const networkSpeedFee = await page.$eval('#send_network_speed_avg_fee', el => el.textContent.trim())
    expect(networkSpeedFee).contains(fastFeeAmount)
    // Click Review Button
    await sendPage.ClickSendReview(page)
    // Confirm SEND button & Review
    await sendPage.ConfirmSend(page)
    // Transaction details page validations
    const domain = 'https://explorer.testnet.rsk.co'
    await transactionDetailsPage.ValidateSentAmount(page, `${coinsToSend} ${coinName}`)
    await transactionDetailsPage.ValidateSentToLink(page, `${domain}/address`)
    await transactionDetailsPage.ValidateNetworkSpeedFee(page)
    await transactionDetailsPage.ValidateTime(page)
    await transactionDetailsPage.ValidateStatus(page)
    await transactionDetailsPage.ValidateTransactionIDLink(page, `${domain}/tx`)
  })
  it('Send SOV to another SOV with custom fee (Slow)', async () => {
    // Network speed
    await sendPage.ClickNetworkSpeedFee(page)
    expect(await page.$eval('#average', (el) => el.getAttribute('class')), 'Avg network speed/fee by default selected')
    // Select Custom network speed fee
    await page.click('#custom_network_speed_button')
    // By default Average is active
    await page.waitForSelector('#average', { visible: true })
    expect(await page.$eval('#average', (el) => el.getAttribute('class')), 'Avg network speed/fee by default selected')
      .contains('active')
    // Choose slow Network speed
    await page.click('#slow')
    // #fast > div.custom-fee-amount
    const slowFeeAmount = await page.$eval('#slow > div.custom-fee-amount', el => el.textContent.trim())
    const slowFeeFiatAmount = await page.$eval('#slow > div.custom-fee-fiat', el => el.textContent.trim())
    expect(slowFeeFiatAmount).not.contains('0.00')
    // Apply Custom fee button
    await page.click('#custom_fee_apply_button')
    await page.waitForSelector('#send_network_speed', { visible: true })
    await page.click('#send_network_speed')
    expect(await page.$eval('#slow', (el) => el.getAttribute('class')), 'Slow network speed/fee selected').contains('active')
    const networkSpeedFee = await page.$eval('#send_network_speed_avg_fee', el => el.textContent.trim())
    expect(networkSpeedFee).contains(slowFeeAmount)
    // Click Review Button
    await sendPage.ClickSendReview(page)
    // Confirm SEND button & Review
    await sendPage.ConfirmSend(page)
    // Transaction details page validations
    const domain = 'https://explorer.testnet.rsk.co'
    await transactionDetailsPage.ValidateSentAmount(page, `${coinsToSend} ${coinName}`)
    await transactionDetailsPage.ValidateSentToLink(page, `${domain}/address`)
    await transactionDetailsPage.ValidateNetworkSpeedFee(page)
    await transactionDetailsPage.ValidateTime(page)
    await transactionDetailsPage.ValidateStatus(page)
    await transactionDetailsPage.ValidateTransactionIDLink(page, `${domain}/tx`)
  })

  after(async () => {
    try {
      await page.close()
      await browser.close()
    } catch (e) {
      throw new Error(e)
    }
  })
})
