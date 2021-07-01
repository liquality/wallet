const chalk = require('chalk')
const expect = require('chai').expect

class SendPage {
  /**
   * Enter SEND amount in SEND view.
   * @param page
   * @param coinsToSend
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterSendAmount (page, coinsToSend) {
    // Enter send amount (or) coins
    const addressInputField = await page.$('#send_amount_input_field')
    await addressInputField.click({ clickCount: 3 })
    await addressInputField.type(coinsToSend)
  }

  /**
   * Enter SEND to address.
   * @param page
   * @param sendToAddress
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterSendToAddress (page, sendToAddress) {
    await page.type('#address', sendToAddress)
  }

  /**
   * Click on SEND Review button
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickSendReview (page) {
    // Wait for Review button Enabled
    await page.waitForSelector('#send_review_button:not([disabled]')
    await page.click('#send_review_button')
    await page.waitForSelector('.confirm-address', { visible: true })
  }

  /**
   * Confirm SEND button.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async SendConfirmButton (page) {
    await page.waitForSelector('#send_button_confirm', { visible: true })
    await page.click('#send_button_confirm')
    await page.waitForSelector('.list-item-detail-icon', {
      visible: true,
      timeout: 120000
    })
    await page.click('.list-item-detail-icon')
  }

  /**
   * Review Button has been disabled.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async HasReviewButtonDisabled (page) {
    expect(await page.$('#send_review_button[disabled]'),
      'Send Review Button should be disabled if address wrong format (or) send limit is higher than')
      .not.to.equal(null)
    console.log(chalk.green.underline.bold('Send Review Button disabled!'))
  }

  /**
   * Validate address format error message.
   * @param page
   * @param message
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateAddressFormatError (page, message) {
    await page.waitForSelector('#address_format_error', { visible: true })
    expect(await page.$eval('#address_format_error', el => el.innerText)).equals(message)
  }

  /**
   * Validate send amount main error message.
   * @param page
   * @param message
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateAmountLimitError (page, message) {
    await page.waitForSelector('.send-main-errors', { visible: true })
    expect(await page.$eval('.send-main-errors', el => el.innerText)).equals(message)
  }

  /**
   * Click Max Send amount
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async SelectMaxSend (page) {
    await page.click('#max_send_amount_button')
  }

  /**
   * Get SEND amount from input.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSendAmount (page) {
    return await page.$eval('#send_amount_input_field', el => el.value)
  }

  /**
   * Get Available Balance from send view.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetSendAvailableBalance (page) {
    return await page.$eval('#send_available_balance', el => el.innerText)
  }

  /**
   * Get Network Speed fee.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetNetworkSpeedFee (page) {
    await page.waitForSelector('#send_network_speed_avg_fee', { visible: true })
    await page.waitForTimeout(5000)
    return await page.$eval('#send_network_speed_avg_fee', el => el.innerText)
  }

  /**
   * Click on Network Speed/FEE option
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickNetworkSpeedFee (page) {
    await page.click('#send_network_speed')
    await page.waitForSelector('#average', { visible: true })
  }
}

module.exports = SendPage
