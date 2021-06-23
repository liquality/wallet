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
    await page.waitForSelector('.transaction-list', { visible: true })
    await page.waitForSelector('.list-item-detail-icon', { visible: true })
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
}

module.exports = SendPage
