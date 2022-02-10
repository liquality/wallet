const TestUtil = require('../utils/TestUtils')

const testUtil = new TestUtil()

const puppeteer = require('puppeteer')
const expect = require('chai').expect

class SwapPage {
  /**
   * Enter SEND amount in SWAP view.
   * @param page
   * @param {string} amountToSend - amount to enter in send input
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterSendAmountOnSwap(page, amountToSend) {
    // Enter send amount (or) coins
    const addressInputField = await page.$('#swap_send_amount_input_field')
    await addressInputField.click({ clickCount: 3 })
    await addressInputField.press('Backspace')
    await addressInputField.press('Backspace')
    await addressInputField.type(amountToSend)
  }

  /**
   * Click on Min.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnMin(page) {
    await page.waitForSelector('#min_amount_send_button', { visible: true })
    await page.click('#min_amount_send_button')
  }

  /**
   * Click on Max from swap screen.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnMax(page) {
    await page.waitForSelector('#max_amount_send_button', { visible: true })
    await page.click('#max_amount_send_button')
  }

  /**
   * Get SWAP send errors
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSwapSendErrors(page) {
    await page.waitForSelector('.swap-send-main-errors', {
      visible: true,
      timeout: 60000
    })
    return await page.$eval('.swap-send-main-errors', (el) => el.textContent)
  }

  /**
   * Review button has been disabled.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async HasReviewButtonDisabled(page) {
    await page.waitForSelector('#swap_review_button')
    expect(
      await page.$eval('#swap_review_button', (el) => el.getAttribute('disabled')),
      'Swap review button should be disabled'
    ).contains('disabled')
  }

  /**
   * Receive asset icon click.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async SelectSwapReceiveCoin(page) {
    await page.waitForTimeout(3000)
    await page.click('.swap-receive-main-icon')
    try {
      await page.waitForSelector('#search_for_a_currency', {
        visible: true,
        timeout: 60000
      })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'search_for_a_currency-issue')
      expect(e, 'Search for a currency not loaded').equals(null)
    }
  }

  /**
   * Get Selected service provider from SWAP screen.
   * @param page
   * @returns {Promise<*>} - Liquality, Thorchain....
   * @constructor
   */
  async getSelectedServiceProvider(page) {
    await page.waitForSelector('#selectedQuote_provider', { visible: true })
    return await page.$eval('#selectedQuote_provider', (el) => el.textContent)
  }

  /**
   * Check SWAP Screen Review button has been Enabled.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async clickSwapReviewButton(page) {
    try {
      await page.waitForSelector('#swap_review_button', {
        visible: true,
        timeout: 60000
      })
      await page.click('#swap_review_button')
    } catch (e) {
      await testUtil.takeScreenshot(page, 'swap-review-button-disabled-issue')
      expect(e, 'Click SWAP review button not working properly').equals(null)
    }
  }

  /**
   * Click on Initiate Swap button.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickInitiateSwapButton(page) {
    await page.waitForSelector('#initiate_swap_button:not([disabled]', { visible: true })
    await page.click('#initiate_swap_button')
  }

  /**
   * Click on Network and Fee Tab.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateNetworkFeeTab(page) {
    try {
      await page.waitForSelector('#network_speed_fee', { visible: true })
      await page.click('#network_speed_fee')
    } catch (e) {
      await testUtil.takeScreenshot(page, 'network_speed_fee-issue')
      expect(e, 'Network speed fee tab not loaded').equals(null)
    }

    try {
      await page.waitForSelector('#average', { visible: true, timeout: 90000 })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'average-fee-tab-issue')
      expect(e, 'Average fee tab not loaded').equals(null)
    }
    const averageFee = await page.$eval('#average', (el) => el.getAttribute('class'))
    expect(averageFee, 'Avg network speed/fee by default selected').contains('active')
    expect(averageFee, 'Avg network speed/fee should have tooltip').contains('has-tooltip')
  }

  /**
   * Get SEND amount from SWAP input.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSwapSendAmount(page) {
    await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
    return await page.$eval('#swap_send_amount_input_field', (el) => el.value)
  }

  /**
   * Get SEND amount value from review page.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSwapSendAmountValue(page) {
    try {
      await page.waitForSelector('#send_swap_confirm_value', {
        visible: true,
        timeout: 60000
      })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'send-swap-review-amount-screen-issue')
      expect(e, 'Click Swap initiated not worked, swap review screen not loaded').equals(null)
    }
    return await page.$eval('#send_swap_confirm_value', (el) => el.textContent)
  }

  /**
   * Get the SEND amount value from review page.
   * @param page
   * @return {Promise<*>}
   * @constructor
   */
  async getSwapFromFiatValue(page) {
    await page.waitForTimeout(5000)
    await page.waitForSelector('#send_swap_amount_fiat', { visible: true })
    return await page.$eval('#send_swap_amount_fiat', (el) => el.textContent)
  }

  async GetSwapSendNetworkFeeValue(page) {
    await page.waitForSelector('#swap_send_network_fee_value', { visible: true })
    return await page.$eval('#swap_send_network_fee_value', (el) => el.textContent)
  }

  /**
   * Get fiat values from SWAP page
   * @param page
   * @return {Promise<{sendFromFiat: *, toFiat: *}>}
   */
  async getSwapFiatValues(page) {
    await page.waitForSelector('.swap-send-top-amount', { visible: true })
    let sendFromFiat = await page.$eval('.swap-send-top-amount', (el) => el.textContent)
    let toFiat = await page.$eval('.swap-receive-top-amount', (el) => el.textContent)
    return {
      sendFromFiat,
      toFiat
    }
  }

  /**
   * Get the SWAP available balance from SWAP page.
   * @param page
   * @return {Promise<*>} SWAP available balance
   * @constructor
   */
  async getSwapAvailableBalance(page) {
    await page.waitForSelector('.swap-send-bottom-available', { visible: true })
    let availableBalance = await page.$eval('.swap-send-bottom-available', (el) => el.textContent)
    if(availableBalance.includes('NaN')){
      expect.fail('Available balance is NaN')
    }
    let balance = availableBalance.replace(/[^\d.-]/g, '')
    return {
      availableBalance: parseFloat(balance)
    }
  }

  /**
   * Get Network fee from SEND section.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSwapSendNetworkFeeInDollar(page) {
    await page.waitForSelector('#swap_send_network_fee_fiat_rate', { visible: true })
    await page.waitForTimeout(10000)
    return await page.$eval('#swap_send_network_fee_fiat_rate', (el) => el.textContent)
  }

  async GetSwapSendAccountFeesValue(page) {
    await page.waitForSelector('#swap_send_amount_fees_value', { visible: true })
    return await page.$eval('#swap_send_amount_fees_value', (el) => el.textContent)
  }

  async GetSwapSendAccountFeesInDollar(page) {
    await page.waitForSelector('#swap_send_amount_fees_fiat_rate', { visible: true })
    return await page.$eval('#swap_send_amount_fees_fiat_rate', (el) => el.textContent)
  }

  async GetSwapReceiveAmountValue(page) {
    await page.waitForSelector('#receive_swap_confirm_value', { visible: true })
    return await page.$eval('#receive_swap_confirm_value', (el) => el.textContent)
  }

  /**
   * Get the SEND to amount value from review page.
   * @param page
   * @return {Promise<*>}
   * @constructor
   */
  async getSwapToAssetFiatValue(page) {
    await page.waitForSelector('#receive_swap_amount_fiat', { visible: true })
    return await page.$eval('#receive_swap_amount_fiat', (el) => el.textContent)
  }

  async GetSwapReceiveNetworkValue(page) {
    await page.waitForSelector('#swap_receive_network_fee_value', { visible: true })
    return await page.$eval('#swap_receive_network_fee_value', (el) => el.textContent)
  }

  async GetSwapReceiveNetworkInDollar(page) {
    await page.waitForSelector('#swap_receive_network_fee_fiat_rate', { visible: true })
    return await page.$eval('#swap_receive_network_fee_fiat_rate', (el) => el.textContent)
  }

  async GetSwapReceiveAccountFeeValue(page) {
    await page.waitForSelector('#swap_receive_amount_fee_value', { visible: true })
    return await page.$eval('#swap_receive_amount_fee_value', (el) => el.textContent)
  }

  /**
   * Get Swap receive fiat amount.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSwapReceiveAccountFeeInDollar(page) {
    await page.waitForSelector('#swap_receive_total_amount_in_fiat', { visible: true })
    return await page.$eval('#swap_receive_total_amount_in_fiat', (el) => el.textContent)
  }

  async GetSwapRate(page) {
    await page.waitForSelector('#swap-rate_value', { visible: true })
    return await page.$eval('#swap-rate_value', (el) => el.textContent)
  }

  /**
   *  Fees are high. Review transaction carefully.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async CheckFeesAreHigh(page) {
    try {
      await page.waitForSelector('#fees_are_high', { visible: true, timeout: 90000 })
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        await testUtil.takeScreenshot(page, 'fee-are-high-not-displayed')
        expect(e, 'Fees are high. Review transaction carefully messages not displayed....').equals(
          null
        )
      }
    }
    const messages = await page.$eval('#fees_are_high', (el) => el.textContent)
    expect(messages.trim()).equals('Fees are high. Review transaction carefully.')
  }

  /**
   * Check If the swap contains the right message
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateMessage(page) {
    const message = await page.$eval('#media-body-info', (el) => el.textContent)
    expect(message).contain.oneOf([
      'If the swap doesn’t complete in 3 hours, you will be refunded in 6 hours at',
      'Max slippage is 0.5%.'
    ])
  }
}

module.exports = SwapPage
