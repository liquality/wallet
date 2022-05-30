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

describe.only('SWAP feature["MAINNET"]', async () => {
    beforeEach(async () => {
        browser = await puppeteer.launch(testUtil.getChromeOptions())
        page = await browser.newPage()
        await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 60000 })

        // Import wallet option and accept Terms
        await homePage.ClickOnImportWallet(page)
        await homePage.ScrollToEndOfTerms(page)
        await homePage.ClickOnAcceptPrivacy(page)

        // Enter seed words and submit
        await homePage.EnterSeedWords(page)

        // Create a password & submit
        await passwordPage.SubmitPasswordDetails(page)

        // overview page
        await overviewPage.CloseWatsNewModal(page)
        await overviewPage.HasOverviewPageLoaded(page)
        await overviewPage.SelectNetwork(page, 'mainnet')
      })
      afterEach(async () => {
        await browser.close()
      })

      it('SWAP ARBETH to PWETH - Hop', async () => {
        const fromAsset = 'ARBETH'
        const toAsset = 'PWETH'
    
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
        await page.type('#search_for_a_currency', 'PWETH')
        await page.waitForSelector(`#${toAsset}`, { timeout: 120000, visible: true })
        await page.click(`#${toAsset}`)
        console.log(`User selected ${toAsset} as 2nd pair for swap`)
    
        // Update the SWAP value to 0.001128
        await swapPage.EnterSendAmountOnSwap(page, '0.001128')

        // Verify Quote provider is displayed
        try {
          await page.waitForSelector('#selectedQuote_provider', {
            visible: true,
            timeout: 60000
          })
        } catch (e) {
          await testUtil.takeScreenshot(page, 'arbeth-pweth-quote-issue')
          expect(e, 'ARBETH->PWETH failed, quote not displayed.....').equals(null)
        }
    
        await page.waitForTimeout(10000)
        expect(
          await page.$eval('#selectedQuote_provider', (el) => el.textContent),
          'ARBETH->PWETH,Hop swap Provider!!'
        ).oneOf(['Hop'])

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
        expect(swapSendAccountFeesValue.trim()).contain('ARBETH')
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
        expect(receiveAccountFeesValue.trim()).contain('PWETH')

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

      it('SWAP USDC to PUSDC - Hop', async () => {
        const fromAsset = 'USDC'
        const toAsset = 'PUSDC'
    
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
        await page.type('#search_for_a_currency', 'PUSDC')
        await page.waitForSelector(`#${toAsset}`, { timeout: 120000, visible: true })
        await page.click(`#${toAsset}`)
        console.log(`User selected ${toAsset} as 2nd pair for swap`)
    
        // Update the SWAP value to 1.998001
        await swapPage.EnterSendAmountOnSwap(page, '1.998001')

        // Verify Quote provider is displayed
        try {
          await page.waitForSelector('#selectedQuote_provider', {
            visible: true,
            timeout: 60000
          })
        } catch (e) {
          await testUtil.takeScreenshot(page, 'usdc-pusdc-quote-issue')
          expect(e, 'USDC->PUSDC failed, quote not displayed.....').equals(null)
        }
    
        await page.waitForTimeout(10000)
        expect(
          await page.$eval('#selectedQuote_provider', (el) => el.textContent),
          'USDC->PUSDC,Hop swap Provider!!'
        ).oneOf(['Hop'])

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
        expect(swapSendAccountFeesValue.trim()).contain('USDC')
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
        expect(receiveAccountFeesValue.trim()).contain('PUSDC')

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
