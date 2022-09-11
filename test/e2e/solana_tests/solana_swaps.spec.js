const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const SwapPage = require('../../pages/SwapPage')
const AddCustomTokenPage = require('../../pages/AddCustomTokenPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()
const addCustomTokenPage = new AddCustomTokenPage()

let browser, page

describe.skip('SWAP feature["MAINNET"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 0 })

    // Import wallet option and accept Terms
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

  it('SWAP SOL to soLINK - Solana [PULL_REQUEST_TEST]', async () => {
    const fromAsset = 'SOL'
    const toAsset = 'soLINK'

    // Click fromAsset
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector('#' + fromAsset + '_swap_button', { visible: true })
    await page.click('#' + fromAsset + '_swap_button')
    console.log(`User clicked on ${fromAsset} SWAP button`)
    await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
    console.log('SWAP screen has been displayed with send amount input field')

    // Select toAsset
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector('#search_for_a_currency')
    await page.type('#search_for_a_currency', 'soLINK', { delay: 100 })
    console.log('User typed soLINK in search field')
    await page.waitForSelector('#soLINK')
    await page.click('#soLINK')
    console.log(`User selected ${toAsset} as 2nd pair for swap`)

    // Update the SWAP value to 0.1
    await swapPage.EnterSendAmountOnSwap(page, '0.1')

    // Verify Quote provider is displayed
    try {
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'sol-solink-quote-issue')
      expect(e, 'SOL->soLINK failed, quote not displayed.....').equals(null)
    }

    await page.waitForTimeout(10000)
    expect(
      await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'SOL->soLINK,Jupiter swap Provider!!'
    ).oneOf(['Jupiter'])

    //Click swap types
    await page.click('#swap_types_option')
    await page.click('.modal-close')

    // Click on SWAP Review button
    await swapPage.clickSwapReviewButton(page)

    // SWAP SEND details validation
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain(fromAsset)
    console.log('SEND Swap value: ' + sendAmountValue)

    // Send confirm USD value
    const swapSendAmountInDollar = await swapPage.getSwapFromFiatValue(page)
    expect(
      swapSendAmountInDollar.trim(),
      `Send Network fee should not be $0.00 for ${fromAsset}`
    ).not.equals('$0.00')
    console.log('User SEND Swap value in USD: ' + swapSendAmountInDollar)

    // Send Account+FEES
    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain('SOL')
    console.log('User SEND Account+FEES value: ' + swapSendAccountFeesValue)

    // Send Accounts+FEES in USD
    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).not.contain('$00.00')
    console.log('User SEND Account+FEES value in USD: ' + swapSendAccountFeesInDollar)

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(toAsset)

    // Receive fiat amount in $
    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim(), 'Swap receive fiat amount should not be 0.00').not.contain(
      '$0.00'
    )
    expect(receiveAmountInDollar.trim()).not.contain('NaN')

    // Receive Network Fee
    const receiveNetworkFeeValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveNetworkFeeValue.trim()).contain(toAsset)

    // Receive Network Fee fiat total
    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('$0.00')
    expect(receiveNetworkFeeInDollar.trim()).not.contain('NaN')

    // Receive Amount+Fees fee
    const receiveAccountFeesValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveAccountFeesValue.trim()).contain('soLINK')

    // Receive Amount+Fees fiat value
    const receiveAccountFeesInDollar = await swapPage.GetSwapReceiveNetworkInDollar(page)
    expect(
      receiveAccountFeesInDollar.trim(),
      `Receive Network fee should not be $0.00 for ${toAsset}`
    ).not.contain('$0.00')
    expect(receiveAccountFeesInDollar.trim()).not.contain('NaN')

    // RATE
    await page.waitForSelector('#swap-rate_value')

    //Check if SWAP Initiate button is enabled
    await page.waitForSelector('#initiate_swap_button:not([disabled])', { timeout: 5000 })
    await page.click('#initiate_swap_button')
  })

  it('SWAP SOL to CWAR(custom token) - Solana', async () => {
    const fromAsset = 'SOL'
    const toAsset = 'CWAR'

   const tokenDetails = {
      chain: 'solana',
      address: 'HfYFjMKNZygfMC8LsQ8LtpPsPxEJoXJx4M6tqi75Hajo',
      name: 'Cryowar Token',
      symbol: 'CWAR',
      decimal: '9'
    }
    // Click on add custom token option
    await overviewPage.ClickAddCustomToken(page)
    // Add Custom token screen
    await addCustomTokenPage.SelectChainDropdown(page, `${tokenDetails.chain}`)
    // paste address
    await addCustomTokenPage.EnterCustomTokenAddress(page, tokenDetails.address)
    // Validated the token details
    const fetchedTokenDetails = await addCustomTokenPage.GetTokenDetails(page)
    expect(fetchedTokenDetails.tokenName).to.equals(tokenDetails.name)
    expect(fetchedTokenDetails.tokenSymbol).to.equals(tokenDetails.symbol)
    expect(fetchedTokenDetails.tokenDecimal).to.equals(tokenDetails.decimal)
    // Click on Add Token button
    await addCustomTokenPage.AddTokenButton(page)

    //Click overview link
    await page.waitForSelector('.navbar_prev_icon')
    await page.click('.navbar_prev_icon')

    // Click fromAsset
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector('#' + fromAsset + '_swap_button', { visible: true })
    await page.click('#' + fromAsset + '_swap_button')
    console.log(`User clicked on ${fromAsset} SWAP button`)
    await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
    console.log('SWAP screen has been displayed with send amount input field')

    // Select toAsset
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector('#search_for_a_currency')
    await page.type('#search_for_a_currency', 'CWAR')
    await page.waitForSelector(`#${toAsset}`, { timeout: 120000, visible: true })
    await page.click(`#${toAsset}`)
    console.log(`User selected ${toAsset} as 2nd pair for swap`)

    // Update the SWAP value to 0.1
    await swapPage.EnterSendAmountOnSwap(page, '0.1')

    // Verify Quote provider is displayed
    try {
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'sol-cwar-quote-issue')
      expect(e, 'SOL->CWAR failed, quote not displayed.....').equals(null)
    }

    await page.waitForTimeout(10000)
    expect(
      await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'SOL->CWAR,Jupiter swap Provider!!'
    ).oneOf(['Jupiter'])

    //Click swap types
    await page.click('#swap_types_option')
    await page.click('.modal-close')

    // Click on SWAP Review button
    await swapPage.clickSwapReviewButton(page)

    // SWAP SEND details validation
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain(fromAsset)
    console.log('SEND Swap value: ' + sendAmountValue)

    // Send confirm USD value
    const swapSendAmountInDollar = await swapPage.getSwapFromFiatValue(page)
    expect(
      swapSendAmountInDollar.trim(),
      `Send Network fee should not be $0.00 for ${fromAsset}`
    ).not.equals('$0.00')
    console.log('User SEND Swap value in USD: ' + swapSendAmountInDollar)

    // Send Account+FEES
    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain('SOL')
    console.log('User SEND Account+FEES value: ' + swapSendAccountFeesValue)

    // Send Accounts+FEES in USD
    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).not.contain('$00.00')
    console.log('User SEND Account+FEES value in USD: ' + swapSendAccountFeesInDollar)

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(toAsset)

    // Receive fiat amount in $
    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim(), 'Swap receive fiat amount should not be 0.00').not.contain(
      '$0.00'
    )
    expect(receiveAmountInDollar.trim()).not.contain('NaN')

    // Receive Network Fee
    const receiveNetworkFeeValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveNetworkFeeValue.trim()).contain(toAsset)

    // Receive Network Fee fiat total
    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('$0.00')
    expect(receiveNetworkFeeInDollar.trim()).not.contain('NaN')

    // Receive Amount+Fees fee
    const receiveAccountFeesValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveAccountFeesValue.trim()).contain('soLINK')

    // Receive Amount+Fees fiat value
    const receiveAccountFeesInDollar = await swapPage.GetSwapReceiveNetworkInDollar(page)
    expect(
      receiveAccountFeesInDollar.trim(),
      `Receive Network fee should not be $0.00 for ${toAsset}`
    ).not.contain('$0.00')
    expect(receiveAccountFeesInDollar.trim()).not.contain('NaN')

    // RATE
    await page.waitForSelector('#swap-rate_value')

    //Check if SWAP Initiate button is enabled
    await page.waitForSelector('#initiate_swap_button:not([disabled])', { timeout: 5000 })
    await page.click('#initiate_swap_button')
  })

  it('SWAP SOL20 to SOL20 - Solana', async () => {
    const fromAsset = 'soLINK'
    const toAsset = 'sUSDC'

    // Search fromAsset
    await page.waitForSelector('#swap_action')
    await page.click('#swap_action')
    await page.waitForSelector('#search_for_a_currency_search')
    await page.type('#search_for_a_currency_search', 'soLINK')
    await page.waitForSelector(`#${fromAsset}`, { timeout: 120000, visible: true })
    await page.click(`#${fromAsset}`)
    console.log(`User selected ${fromAsset} as 1st pair for swap`)

    // Select toAsset
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector('#search_for_a_currency')
    await page.type('#search_for_a_currency', 'sUSDC')
    await page.waitForSelector(`#${toAsset}`, { timeout: 120000, visible: true })
    await page.click(`#${toAsset}`)
    console.log(`User selected ${toAsset} as 2nd pair for swap`)

    // Update the SWAP value to 0.1
    await swapPage.EnterSendAmountOnSwap(page, '0.1')

    // Verify Quote provider is displayed
    try {
      await page.waitForSelector('#selectedQuote_provider', {
        visible: true,
        timeout: 60000
      })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'solink-susdc-quote-issue')
      expect(e, 'soLINK->sUSDC failed, quote not displayed.....').equals(null)
    }

    await page.waitForTimeout(10000)
    expect(
      await page.$eval('#selectedQuote_provider', (el) => el.textContent),
      'soLINK->sUSDC,Jupiter swap Provider!!'
    ).oneOf(['Jupiter'])

    //Click swap types
    await page.click('#swap_types_option')
    await page.click('.modal-close')

    // Click on SWAP Review button
    await swapPage.clickSwapReviewButton(page)

    // SWAP SEND details validation
    const sendAmountValue = await swapPage.GetSwapSendAmountValue(page)
    expect(sendAmountValue.trim()).contain(fromAsset)
    console.log('SEND Swap value: ' + sendAmountValue)

    // Send confirm USD value
    const swapSendAmountInDollar = await swapPage.getSwapFromFiatValue(page)
    expect(
      swapSendAmountInDollar.trim(),
      `Send Network fee should not be $0.00 for ${fromAsset}`
    ).not.equals('$0.00')
    console.log('User SEND Swap value in USD: ' + swapSendAmountInDollar)

    // Send Account+FEES
    const swapSendAccountFeesValue = await swapPage.GetSwapSendAccountFeesValue(page)
    expect(swapSendAccountFeesValue.trim()).contain('SOL')
    console.log('User SEND Account+FEES value: ' + swapSendAccountFeesValue)

    // Send Accounts+FEES in USD
    const swapSendAccountFeesInDollar = await swapPage.GetSwapSendAccountFeesInDollar(page)
    expect(swapSendAccountFeesInDollar.trim()).not.contain('$00.00')
    console.log('User SEND Account+FEES value in USD: ' + swapSendAccountFeesInDollar)

    // Receive details validation
    const receiveAmountValue = await swapPage.GetSwapReceiveAmountValue(page)
    expect(receiveAmountValue.trim()).contain(toAsset)

    // Receive fiat amount in $
    const receiveAmountInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveAmountInDollar.trim(), 'Swap receive fiat amount should not be 0.00').not.contain(
      '$0.00'
    )
    expect(receiveAmountInDollar.trim()).not.contain('NaN')

    // Receive Network Fee
    const receiveNetworkFeeValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveNetworkFeeValue.trim()).contain(toAsset)

    // Receive Network Fee fiat total
    const receiveNetworkFeeInDollar = await swapPage.GetSwapReceiveAccountFeeInDollar(page)
    expect(receiveNetworkFeeInDollar.trim()).not.contain('$0.00')
    expect(receiveNetworkFeeInDollar.trim()).not.contain('NaN')

    // Receive Amount+Fees fee
    const receiveAccountFeesValue = await swapPage.GetSwapReceiveNetworkValue(page)
    expect(receiveAccountFeesValue.trim()).contain('sUSDC')

    // Receive Amount+Fees fiat value
    const receiveAccountFeesInDollar = await swapPage.GetSwapReceiveNetworkInDollar(page)
    expect(
      receiveAccountFeesInDollar.trim(),
      `Receive Network fee should not be $0.00 for ${toAsset}`
    ).not.contain('$0.00')
    expect(receiveAccountFeesInDollar.trim()).not.contain('NaN')

    // RATE
    await page.waitForSelector('#swap-rate_value')

    //Check if SWAP Initiate button is enabled
    await page.waitForSelector('#initiate_swap_button:not([disabled])', { timeout: 5000 })
    await page.click('#initiate_swap_button')
  })

})
