const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const SwapPage = require('../Pages/SwapPage')
const expect = require('chai').expect
const chalk = require('chalk')
const https = require('https')

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()

let browser, page
const password = '123123123'

describe('Liquality wallet SWIPE feature', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
  })
  afterEach(async () => {
    try {
      console.log('Cleaning up instances')
      await page.close()
      await browser.close()
    } catch (e) {
      console.log('Cannot cleanup instances')
    }
  })

  it('SWAP BTC to ETH (LIQUALITY)', async () => {
    const asset1 = 'BTC'
    const asset2 = 'ETH'

    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on BTC then click on SWAP button
    await overviewPage.SelectChain(page, asset1)
    await page.waitForSelector('#BTC_swap_button', { visible: true })
    await page.click('#BTC_swap_button')
    console.log(chalk.green('User clicked on BTC SWAP button'))
    // Validate min SEND amount from text field & check Min is Active
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'BTC to ETH SWAP min value not set in input').not.equals('0.0000')
    await swapPage.ClickOnMin(page)
    // Rate & source provider validation (BTC->ETH source chosen is LIQUALITY)
    await page.waitForSelector('#bestQuote_provider', { visible: true })
    expect(await page.$eval('#bestQuote_provider', (el) => el.textContent),
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
    await page.waitForSelector('#swap_rate_value')

    // Validate message
    await swapPage.ValidateMessage(page)
    // Check SWAP Initiate option has been enabled
    await page.waitForSelector('#initiate_swap_button:not([disabled])', { timeout: 5000 })
  })
  it('SWAP ETH to DAI - not cross chain (UNISWAP V2)', async () => {
    const asset1 = 'ETH'
    const asset2 = 'DAI'

    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on ETH then click on SWAP button
    await overviewPage.SelectChain(page, asset1)
    await page.waitForSelector('#ETH_swap_button', { visible: true })
    await page.click('#ETH_swap_button')
    console.log(chalk.green('User clicked on ETH SWAP button'))
    // Validate min SEND amount from text field & check Min is Active
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'ETH to DAI SWAP min value not set in input').not.equals('0.0000')
    await swapPage.ClickOnMin(page)
    // Select 2nd Pair (DAI)
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector('#ETHEREUM', { visible: true })
    await page.click('#ETHEREUM')
    await page.waitForSelector('#DAI', { visible: true })
    await page.click('#DAI')
    // Rate & source provider validation (ETH->DAI source chosen is Uniswap V2)
    await page.waitForSelector('#bestQuote_provider', { visible: true, timeout: 60000 })
    expect(await page.$eval('#bestQuote_provider', (el) => el.textContent),
      'ETH->DAI, Uniswap V2 source should be chosen!').equals('Uniswap V2')

    // Click on Network speed + FEE
    await swapPage.ValidateNetworkFeeTab(page)
    // Click on Network speed + FEE & Validate
    const networkSpeedFee = await page.$eval('#details_header_chevron_down_icon', el => el.textContent)
    expect(networkSpeedFee).contain(asset1 + ' Avg')
    // expect(networkSpeedFee).contain(asset2 + ' Avg')

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
    expect(receiveNetworkFeeValue.trim()).contain(asset1)

    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('$0.00')
    expect(receiveNetworkFeeInDollar.trim()).not.contain('NaN')

    const receiveAccountFeesValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveAccountFeesValue.trim()).contain(asset1)

    const receiveAccountFeesInDollar = await swapPage.GetSwapReceiveNetworkInDollar(page)
    expect(receiveAccountFeesInDollar.trim()).not.contain('$00.00')
    expect(receiveAccountFeesInDollar.trim()).not.contain('NaN')
    // RATE
    await page.waitForSelector('#swap_rate_value')

    // Validate message
    await swapPage.ValidateMessage(page)
    // Check SWAP Initiate option has been enabled
    await page.waitForSelector('#initiate_swap_button:not([disabled])', { timeout: 5000 })
  })
  it('SWAP SOV to BTC-["smoke"]', async () => {
    const asset1 = 'SOV'
    const asset2 = 'BTC'

    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on SOV then click on SWAP button
    await overviewPage.SelectChain(page, asset1)
    await page.waitForSelector('#SOV_swap_button', { visible: true })
    await page.click('#SOV_swap_button')
    console.log(chalk.green('User clicked on SOV SWAP button'))
    // Validate min SEND amount from text field & check Min is Active
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'SOV to BTC SWAP min value not set in input').equals('0.05')
    await page.$eval('#min_amount_send_button', (el) => el.textContent)
    await swapPage.EnterSendAmountOnSwap(page, '1')
    // Click on Network speed + FEE
    await swapPage.ValidateNetworkFeeTab(page)
    // Click on SWAP Review button
    await swapPage.ClickSwapReviewButton(page)

    // SWAP SEND details validation
    // Send confirm value
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain('1 SOV')
    console.log(chalk.green('SEND Swap value: ' + sendAmountValue))
    // Send confirm USD value
    const swapSendAmountInDollar = await swapPage.GetSwapSendAmountInDollar(page)
    expect(swapSendAmountInDollar.trim(), 'SWAP send amount not to be 0.00').equals('$1')
    console.log(chalk.green('User SEND Swap value in USD: ' + swapSendAmountInDollar))
    // Send Network Fee
    const swapSendNetworkFeeValue = await swapPage.GetSwapSendNetworkFeeValue(page)
    expect(swapSendNetworkFeeValue.trim()).contain('RBTC')
    console.log(chalk.green('User SEND Swap Network Fee value: ' + swapSendNetworkFeeValue))
    // Send Network Fee in USD
    const swapSendNetworkFeeInDollar = await swapPage.GetSwapSendNetworkFeeInDollar(page)
    expect(swapSendNetworkFeeInDollar.trim(), 'Send network fee can not be $0.00').not.contain('$0.00')
    console.log(chalk.green('User SEND Swap Network Fee value in USD: ' + swapSendNetworkFeeInDollar))
    // Send Account+FEES
    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain('RBTC')
    console.log(chalk.green('User SEND Account+FEES value: ' + swapSendAccountFeesValue))
    // Send Accounts+FEES in USD
    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).not.contain('$00.00')
    console.log(chalk.green('User SEND Account+FEES value in USD: ' + swapSendAccountFeesInDollar))

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(asset2)

    // Receive fiat amount in $
    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim()).not.contain('$0.00')
    expect(receiveAmountInDollar.trim()).not.contain('NaN')
    // Receive Network Fee
    const receiveNetworkFeeValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveNetworkFeeValue.trim()).contain(asset2)
    // Receive Network Fee fiat total
    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('$0.00')
    expect(receiveNetworkFeeInDollar.trim()).not.contain('NaN')
    // Receive Amount+Fees fee
    const receiveAccountFeesValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveAccountFeesValue.trim()).contain(asset2)
    // Receive Amount+Fees fiat value
    const receiveAccountFeesInDollar = await swapPage.GetSwapReceiveNetworkInDollar(page)
    expect(receiveAccountFeesInDollar.trim()).not.contain('$0.00')
    expect(receiveAccountFeesInDollar.trim()).not.contain('NaN')
    // RATE
    await page.waitForSelector('#swap_rate_value')

    // Validate message
    await swapPage.ValidateMessage(page)

    // Click on Initiate SWAP button
    await swapPage.ClickInitiateSwapButton(page)

    // Wait for Activity tab list of items
    await page.waitForSelector('.transaction-list', { visible: true })
    await page.waitForSelector('.transaction-steps', { visible: true })
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
    console.log(chalk.green('Swap details Advanced button has been displayed'))
    await advancedButton.click()

    const orderIdHref = await page.$eval('#order_id_href_link', (el) => el.href)
    console.log(chalk.green('SWAP Order ID href:' + orderIdHref))
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
  it('SWAP (BTC),Please increase amount. It is below minimum.', async () => {
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // Click on BTC then click on SWAP button
    await overviewPage.SelectChain(page, 'BTC')
    await page.waitForSelector('#BTC_swap_button', { visible: true })
    await page.click('#BTC_swap_button')
    console.log(chalk.green('User clicked on BTC SWAP button'))
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'BTC to ETH SWAP min value not set in input').not.equals('0.0000')
    await swapPage.EnterSendAmountOnSwap(page, '0')
    expect(await swapPage.GetSwapSendErrors(page))
      .contains('Please increase amount. It is below minimum.')
    // Check review button has been disabled
    await swapPage.HasReviewButtonDisabled(page)
  })
  it('SWAP(ETHEREUM),Lower amount. This exceeds available balance.(Thorchain)', async () => {
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page)
    await overviewPage.SelectChain(page, 'ETH')
    await page.waitForSelector('#ETH_swap_button', { visible: true })
    await page.click('#ETH_swap_button')
    console.log(chalk.green('User clicked on ETH SWAP button'))
    const swapSendAmountField = await swapPage.GetSwapSendAmount(page)
    expect(swapSendAmountField, 'ETH SWAP min value not set in input').not.equals('0.0000')
    // Enter 1000
    await swapPage.EnterSendAmountOnSwap(page, '2')
    expect(await swapPage.GetSwapSendErrors(page))
      .to.be.oneOf([' Lower amount. This exceeds available balance. ',
        ' Please reduce amount. It exceeds maximum. '])
    // Rate & source provider validation (BTC if its more than 1 or 2 source chosen is Thorchain)
    await page.waitForSelector('#bestQuote_provider', { visible: true })
    expect(await page.$eval('#bestQuote_provider', (el) => el.textContent),
      'ETH swap, Thorchain source should be chosen!').equals('Thorchain')
    // Check review button has been disabled
    await swapPage.HasReviewButtonDisabled(page)
  })
})
