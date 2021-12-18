const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const SwapPage = require('../pages/SwapPage')
const expect = require('chai').expect

const https = require('https')

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()

let browser, page
const password = '123123123'

describe('SWAP feature["testnet"]', async () => {
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
  })
  afterEach(async () => {
    try {
      await page.close()
      await browser.close()
    } catch (e) {
      throw new Error(e)
    }
  })

  it.skip('SWAP BTC to ETH (LIQUALITY)', async () => {
    const asset1 = 'BTC'
    const asset2 = 'ETH'
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on BTC then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, asset1)
    await page.waitForSelector('#BTC_swap_button', { visible: true })
    await page.click('#BTC_swap_button')
    console.log(('User clicked on BTC SWAP button'))
    // Validate min SEND amount from text field & check Min is Active
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'BTC to ETH SWAP min value not set in input').not.equals('0.0000')
    await swapPage.ClickOnMin(page)
    // Rate & source provider validation (BTC->ETH source chosen is LIQUALITY)
    await page.waitForSelector('#selectedQuote_provider', { visible: true })
    expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'BTC->ETH swap, LIQUALITY source should be chosen!').equals('Liquality')
    // Click on Network speed + FEE
    await swapPage.ValidateNetworkFeeTab(page)
    // Click on Network speed + FEE & Validate BTC Avg/ETH Avg
    const networkSpeedFee = await page.$eval('#details_header_chevron_down_icon', el => el.textContent)
    expect(networkSpeedFee).contain(asset1 + ' Avg')
    expect(networkSpeedFee).contain(asset2 + ' Avg')
    // Review Button
    await swapPage.ClickSwapReviewButton(page)

    // SWAP SEND details validation
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain(asset1)

    const swapSendAmountInDollar = await swapPage.GetSwapSendAmountInDollar(page)
    expect(swapSendAmountInDollar.trim(), 'SWAP send amount not to be 0.00').not.contain('$00.00')

    const swapSendNetworkFeeValue = await swapPage.GetSwapSendNetworkFeeValue(page)
    expect(swapSendNetworkFeeValue.trim()).contain(asset1)

    const swapSendNetworkFeeInDollar = await swapPage.GetSwapSendNetworkFeeInDollar(page)
    expect(swapSendNetworkFeeInDollar.trim(), 'Send network fee can not be $0.00').not.contain('$0.00')

    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain(asset1)

    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).not.contain('$00.00')
    expect(swapSendAccountFeesInDollar.trim()).not.contain('NaN')

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(asset2)

    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim()).not.contain('$00.00')
    expect(receiveAmountInDollar.trim()).not.contain('NaN')

    const receiveNetworkFeeValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveNetworkFeeValue.trim()).contain(asset2)

    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('$0.00')
    expect(receiveNetworkFeeInDollar.trim()).not.contain('NaN')

    const receiveAccountFeesValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveAccountFeesValue.trim()).contain(asset2)

    const receiveAccountFeesInDollar = await swapPage.GetSwapReceiveNetworkInDollar(page)
    expect(receiveAccountFeesInDollar.trim()).not.contain('$00.00')
    expect(receiveAccountFeesInDollar.trim()).not.contain('NaN')
    // RATE
    await page.waitForSelector('#swap-rate_value')

    // Validate message
    await swapPage.ValidateMessage(page)
    // Check SWAP Initiate option has been enabled
    await page.waitForSelector('#initiate_swap_button:not([disabled])', { timeout: 5000 })
  })
  it('SWAP SOV to BTC', async () => {
    const fromAsset = 'SOV'
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on SOV then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector(`#${fromAsset}_swap_button`, { visible: true })
    await page.click(`#${fromAsset}_swap_button`)
    console.log((`User clicked on ${fromAsset} SWAP button`))
    // Validate min SEND amount from text field & check Min is Active
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'SOV to BTC SWAP min value not set in input')
      .equals('0.05')
    await page.$eval('#min_amount_send_button', (el) => el.textContent)
    await swapPage.ClickOnMin(page)
    // Click on Network speed + FEE
    await swapPage.ValidateNetworkFeeTab(page)
    // Click on SWAP Review button
    await swapPage.ClickSwapReviewButton(page)
    // Click on Initiate SWAP button
    await swapPage.ClickInitiateSwapButton(page)

    // Wait for Activity tab list of items - Transaction items
    try {
      await page.waitForSelector('.transaction-list', { visible: true, timeout: 1200000 })
      await page.waitForSelector('.transaction-steps', { visible: true, timeout: 600000 })
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        await testUtil.takeScreenshot(page, 'sov-btc-swap-transaction-not-found')
        expect(e, 'sov to btc swap transaction not found under Activity tab').equals(null)
      }
    }
    const transactionSteps = await page.$eval('.transaction-steps', el => el.textContent)
    expect(transactionSteps).not.contains('NaN')

    const transactions = await page.$$('.transaction-status')
    await transactions[0].click()
    await page.waitForSelector('.swap-details_info', { visible: true })

    await page.waitForSelector('#swap-details-status-section', { visible: true })
    await page.waitForSelector('#pending_receipt_section', { visible: true })
    // Validate Transaction SWAP Network SPEED and
    await page.waitForSelector('#swap-details-network-fee-section', { visible: true })

    // Advanced option
    const advancedButton = await page.waitForSelector('#advanced_button', { visible: true })
    console.log(('Swap details Advanced button has been displayed'))
    await advancedButton.click()

    const orderIdHref = await page.$eval('#order_id_href_link', (el) => el.href)
    console.log(('SWAP Order ID href:' + orderIdHref))
    https.get(orderIdHref, (resp) => {
      console.log('Status Code:', resp.statusCode)
      expect(resp.statusCode).equals(200)
      let data = ''

      resp.on('data', (chunk) => {
        data += chunk
      })

      resp.on('end', () => {
        console.log(JSON.parse(data.toString()))
      })
    }).on('error', (err) => {
      console.log('Error: ' + err.message)
    })
  })
  it('SWAP (BTC->ETH) - Thorchain-[smoke]', async () => {
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on BTC then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, 'BTC')
    await page.waitForSelector('#BTC_swap_button', { visible: true })
    await page.click('#BTC_swap_button')
    console.log(('User clicked on BTC SWAP button'))
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'BTC to ETH SWAP min value not set in input').not.equals('0.0000')
    await swapPage.EnterSendAmountOnSwap(page, '1')
    // Check source name
    await page.waitForSelector('#selectedQuote_provider', { visible: true })
    expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'BTC->ETH swap, Thorchain source should be chosen!').oneOf(['Thorchain', 'Liquality'])
    // Check review button has been disabled
    await swapPage.HasReviewButtonDisabled(page)
  })
  it('SWAP (ETH->BTC) - Thorchain', async () => {
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on BTC then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, 'ETH')
    await page.waitForSelector('#ETH_swap_button', { visible: true })
    await page.click('#ETH_swap_button')
    console.log(('User clicked on ETH SWAP button'))
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'BTC to ETH SWAP min value not set in input').not.equals('0.0000')
    await swapPage.EnterSendAmountOnSwap(page, '1')
    // Check source name
    await page.waitForSelector('#selectedQuote_provider', { visible: true })
    expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'ETH->BTC swap, Thorchain source should be chosen!').oneOf(['Thorchain', 'Liquality'])
  })
  it('SWAP (ETHEREUM),Please increase amount. It is below minimum.', async () => {
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on ETH then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, 'ETH')
    await page.waitForSelector('#ETH_swap_button', { visible: true })
    await page.click('#ETH_swap_button')
    console.log(('User clicked on ETH SWAP button'))
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'ETH to BTC SWAP min value not set in input').not.equals('0.0000')
    await swapPage.EnterSendAmountOnSwap(page, '0.000002')
    expect(await swapPage.GetSwapSendErrors(page))
      .contains('Please increase amount. It is below minimum.')
    // Check review button has been disabled
    await swapPage.HasReviewButtonDisabled(page)
  })
  it('SWAP(ETHEREUM),Lower amount. This exceeds available balance.(Thorchain)', async () => {
    // Select testnet
    await overviewPage.SelectNetwork(page)
    await overviewPage.SelectAssetFromOverview(page, 'ETH')
    await page.waitForSelector('#ETH_swap_button', { visible: true })
    await page.click('#ETH_swap_button')
    console.log(('User clicked on ETH SWAP button'))
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'ETH SWAP min value not set in input').not.equals('0.0000')
    // Enter 1000
    await swapPage.EnterSendAmountOnSwap(page, '1000')
    expect(await swapPage.GetSwapSendErrors(page))
      .to.be.oneOf([' Lower amount. This exceeds available balance. ',
        ' Please reduce amount. It exceeds maximum. '])
    // Rate & source provider validation (BTC if its more than 1 or 2 source chosen is Thorchain)
    await page.waitForSelector('#selectedQuote_provider', { visible: true })
    expect(await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'ETH swap, Thorchain source should be chosen!').oneOf(['Liquality', 'Thorchain'])
    // Check review button has been disabled
    await swapPage.HasReviewButtonDisabled(page)
  })
  it('SWAP (NEAR->BTC)', async () => {
    const fromAsset = 'NEAR'
    const toAsset = 'BTC'
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click first assert then click on SWAP button
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector(`#${fromAsset}_swap_button`, { visible: true })
    await page.click(`#${fromAsset}_swap_button`)
    console.log((`User clicked on ${fromAsset} SWAP button`))

    // Swap screen
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, `${fromAsset} to ${toAsset} SWAP min value not set in input`)
      .not.equals('0.0000')
    // Validate Min has been active
    expect(await page.$eval('#min_amount_send_button', (el) => el.getAttribute('class'))).contain('active')

    // Check source name
    expect(await swapPage.GetSelectedServiceProvider(page),
      `${fromAsset}->${toAsset} swap, source should be chosen!`).oneOf(['Thorchain', 'Liquality'])

    // Click on selected Quote service provider
    await page.click('#selectedQuote_provider')
    await page.waitForSelector('#liquality_rate_provider', { visible: true })
    expect(await page.$eval('#available_quotes_header', (el) => el.textContent)).contain('1 AVAILABLE QUOTES')
    await page.click('#select_quote_button')

    // Get the quote value
    const quoteValueOnSwapScreen = await page.$eval('.swap-rate_value', (el) => el.textContent)

    // Click on Swap Types
    await page.click('#swap_types_option')
    await page.waitForSelector('#learn_about_swaps_types_header', { visible: true })
    console.log(('Learn about Swaps Types model has been displayed'))
    await page.click('.modal-close')

    // Click SWAP review button
    await swapPage.ClickSwapReviewButton(page)
    await page.waitForTimeout(5000)

    // SWAP review screen validations
    // SWAP SEND details validation
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain(fromAsset)
    console.log(`${fromAsset} SEND value on SWAP review page`, sendAmountValue)

    const swapSendAmountInDollar = await swapPage.GetSwapSendAmountInDollar(page)
    console.log(`${fromAsset} SEND value in USD on SWAP review page`, swapSendAmountInDollar)
    expect(swapSendAmountInDollar.trim(), 'SWAP send amount not to be 0.00')
      .not.contain('$0.00')

    const swapSendNetworkFeeValue = await swapPage.GetSwapSendNetworkFeeValue(page)
    console.log(`${fromAsset} SEND Network Fee value on SWAP review page`, swapSendNetworkFeeValue)
    expect(swapSendNetworkFeeValue.trim()).contain(fromAsset)

    await page.waitForTimeout(2000)
    const swapSendNetworkFeeInDollar = await swapPage.GetSwapSendNetworkFeeInDollar(page)
    expect(swapSendNetworkFeeInDollar.trim(), `Send Network fee should not be $0.00 for ${fromAsset}`)
      .not.contain('NaN')

    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain(fromAsset)

    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).not.contain('NaN')

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(toAsset)

    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim()).not.contain('NaN')

    const receiveNetworkFeeValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveNetworkFeeValue.trim()).contain(toAsset)

    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('NaN')

    const receiveAccountFeesValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveAccountFeesValue.trim()).contain(toAsset)

    const receiveAccountFeesInDollar = await swapPage.GetSwapReceiveNetworkInDollar(page)
    expect(receiveAccountFeesInDollar.trim()).not.contain('NaN')
    // RATE
    await page.waitForSelector('#swap_review_rate_block')
    // Swap rate quote value on review screen, ensure quote shouldn't get refreshed from swap screen & review screen
    const quoteValueOnSwapReviewScreenValue = await page.$eval('.swap-rate_value', (el) => el.textContent)
    expect(quoteValueOnSwapScreen.trim(), 'Quote value should be same on SWAP screen & Review screen')
      .equals(quoteValueOnSwapReviewScreenValue.trim())

    // Validate message
    await swapPage.ValidateMessage(page)
    // Check SWAP Initiate option has been enabled
    await page.waitForSelector('#initiate_swap_button:not([disabled])', { timeout: 5000 })
  })
})
