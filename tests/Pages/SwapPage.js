const chalk = require('chalk')
const expect = require('chai').expect

class SwapPage {
  /**
   * Enter SEND amount in SWAP view.
   * @param page
   * @param {string} amountToSend - amount to enter in send input
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterSendAmountOnSwap (page, amountToSend) {
    // Enter send amount (or) coins
    const addressInputField = await page.$('#swap_send_amount_input_field')
    await addressInputField.click({ clickCount: 3 })
    await addressInputField.type(amountToSend)
    console.log(chalk.green('User enters SWAP send amount as ' + amountToSend))
  }

  /**
   * Click on Min.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnMin (page) {
    await page.waitForSelector('#min_amount_send_button', { visible: true })
    await page.click('#min_amount_send_button')
  }

  /**
   * Get SWAP send errors
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSwapSendErrors (page) {
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
  async HasReviewButtonDisabled (page) {
    await page.waitForSelector('#swap_review_button:not([enabled]')
    console.log(chalk.green('SWAP review button has been disabled'))
  }

  async SelectSwapReceiveCoin (page) {
    await page.click('.swap-receive-main-icon', { slowMo: 20 })
    await page.waitForSelector('#search_for_a_currency', { visible: true })
  }

  /**
   * Get Selected service provider from SWAP screen.
   * @param page
   * @returns {Promise<*>} - Liquality, Thorchain....
   * @constructor
   */
  async GetSelectedServiceProvider (page) {
    await page.waitForSelector('#selectedQuote_provider', { visible: true })
    return await page.$eval('#selectedQuote_provider', (el) => el.textContent)
  }

  /**
   * Check SWAP Screen Review button has been Enabled.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickSwapReviewButton (page) {
    console.log('User checking for SWAP Review button is enabled or disabled')
    await page.waitForSelector('#swap_review_button:not([disabled])', {
      timeout: 60000
    })
    await page.click('#swap_review_button')
    console.log(chalk.green('User clicked on SWAP review button'))
  }

  /**
   * Click on Initiate Swap button.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickInitiateSwapButton (page) {
    await page.waitForSelector('#initiate_swap_button:not([disabled]', { visible: true })
    console.log(chalk.green('Initiate swap button has been enabled, almost there...'))
    await page.click('#initiate_swap_button')
    console.log(chalk.green('User clicked on initiate_swap_button option'))
  }

  /**
   * Click on Network and Fee Tab.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateNetworkFeeTab (page) {
    await page.waitForSelector('#network_speed_fee', { visible: true })
    await page.click('#network_speed_fee')
    console.log(chalk.green('user clicked on on Network fee options'))
    expect(await page.$eval('#average', (el) => el.getAttribute('class')),
      'Avg network speed/fee by default selected')
  }

  /**
   * Get SEND amount from SWAP input.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSwapSendAmount (page) {
    await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
    console.log('SWAP screen has been displayed with send amount input field')
    return await page.$eval('#swap_send_amount_input_field', el => el.value)
  }

  /**
   * Get SEND amount value from review page.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSwapSendAmountValue (page) {
    await page.waitForTimeout(5000)
    await page.waitForSelector('#send_swap_confirm_value', { visible: true })
    return await page.$eval('#send_swap_confirm_value', el => el.textContent)
  }

  async GetSwapSendAmountInDollar (page) {
    await page.waitForTimeout(5000)
    await page.waitForSelector('#send_swap_amount_fiat', { visible: true })
    return await page.$eval('#send_swap_amount_fiat', el => el.textContent)
  }

  async GetSwapSendNetworkFeeValue (page) {
    await page.waitForSelector('#swap_send_network_fee_value', { visible: true })
    return await page.$eval('#swap_send_network_fee_value', el => el.textContent)
  }

  /**
   * Get Network fee from SEND section.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSwapSendNetworkFeeInDollar (page) {
    await page.waitForSelector('#swap_send_network_fee_fiat_rate', { visible: true })
    await page.waitForTimeout(10000)
    return await page.$eval('#swap_send_network_fee_fiat_rate', el => el.textContent)
  }

  async GetSwapSendAccountFeesValue (page) {
    await page.waitForSelector('#swap_send_amount_fees_value', { visible: true })
    return await page.$eval('#swap_send_amount_fees_value', el => el.textContent)
  }

  async GetSwapSendAccountFeesInDollar (page) {
    await page.waitForSelector('#swap_send_amount_fees_fiat_rate', { visible: true })
    return await page.$eval('#swap_send_amount_fees_fiat_rate', el => el.textContent)
  }

  async GetSwapReceiveAmountValue (page) {
    await page.waitForSelector('#receive_swap_confirm_value', { visible: true })
    return await page.$eval('#receive_swap_confirm_value', el => el.textContent)
  }

  async GetSwapReceiveAmountInDollar (page) {
    await page.waitForSelector('#receive_swap_amount_fiat', { visible: true })
    return await page.$eval('#receive_swap_amount_fiat', el => el.textContent)
  }

  async GetSwapReceiveNetworkValue (page) {
    await page.waitForSelector('#swap_receive_network_fee_value', { visible: true })
    return await page.$eval('#swap_receive_network_fee_value', el => el.textContent)
  }

  async GetSwapReceiveNetworkInDollar (page) {
    await page.waitForSelector('#swap_receive_network_fee_fiat_rate', { visible: true })
    return await page.$eval('#swap_receive_network_fee_fiat_rate', el => el.textContent)
  }

  async GetSwapReceiveAccountFeeValue (page) {
    await page.waitForSelector('#swap_receive_amount_fee_value', { visible: true })
    return await page.$eval('#swap_receive_amount_fee_value', el => el.textContent)
  }

  async GetSwapReceiveAccountFeeInDollar (page) {
    await page.waitForSelector('#swap_receive_total_amount_in_fiat', { visible: true })
    return await page.$eval('#swap_receive_total_amount_in_fiat', el => el.textContent)
  }

  async GetSwapRate (page) {
    await page.waitForSelector('#swap-rate_value', { visible: true })
    return await page.$eval('#swap-rate_value', el => el.textContent)
  }

  /**
   *  Fees are high. Review transaction carefully.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async CheckFeesAreHigh (page) {
    await page.waitForSelector('#fees_are_high', { visible: true })
    const messages = await page.$eval('#fees_are_high', el => el.textContent)
    expect(messages.trim()).equals('Fees are high. Review transaction carefully.')
    console.log(chalk.redBright('Fees are high. Review transaction carefully.'))
  }

  /**
   * Check If the swap contains the right message
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateMessage (page) {
    const message = await page.$eval('#media-body-info', el => el.textContent)
    expect(message).contain.oneOf([
      'If the swap doesn’t complete in 3 hours, you will be refunded in 6 hours at',
      'Max slippage is 0.5%.'
    ])
  }
}

module.exports = SwapPage
