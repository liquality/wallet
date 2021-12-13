const TestUtil = require('../utils/TestUtils')
const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
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
    await page.waitForSelector('#send_amount_input_field', { visible: true })
    console.log('SEND page has been loaded')
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
    await page.waitForSelector('#address')
    await page.type('#address', sendToAddress, { delay: 100 })
    await page.waitForTimeout(1000)
  }

  /**
   * Click on SEND Review button
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickSendReview (page) {
    // Wait for Review button Enabled
    try {
      await page.waitForSelector('#send_review_button', { visible: true, timeout: 120000 })
      await page.click('#send_review_button')
      await page.waitForSelector('#send_button_confirm', { visible: true, timeout: 120000 })
      console.log('User clicked on confirm SEND review button')
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        await testUtil.takeScreenshot(page, 'click-on-send-review-button')
        expect(e, 'Click SEND review button failed').equals(null)
      }
    }
  }

  /**
   * Confirm SEND button.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ConfirmSend (page) {
    await page.waitForSelector('#send_button_confirm', { visible: true })
    await page.click('#send_button_confirm')
    console.log('User clicked on SEND button Confirm...waiting for Transaction Status')
    await page.waitForTimeout(10000)
    await page.waitForSelector('.transaction-list', {
      visible: true,
      timeout: 120000
    })
    try {
      await page.waitForSelector('.transaction-status', { visible: true, timeout: 60000 })
      await page.click('.transaction-status')
    } catch (e) {
      await testUtil.takeScreenshot(page, 'send-transaction-status-issue')
      expect(e, 'send transaction status issue..').equals(null)
    }
  }

  /**
   * Review Button has been disabled.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async HasReviewButtonDisabled (page) {
    expect(await page.$('#send_review_button'),
      'Send Review Button should be disabled if address wrong format (or) send limit is higher than')
      .not.to.equal(null)
    const sendReviewButton = await page.$eval('#send_review_button', el => el.getAttribute('disabled'))
    expect(sendReviewButton).to.eq('disabled')
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
    // Send screen should have Network speed option
    await page.waitForTimeout(5000)
    await page.waitForSelector('#send_network_speed_avg_fee', { visible: true })
    return await page.$eval('#send_network_speed_avg_fee', el => el.innerText)
  }

  /**
   * Click on Network Speed/FEE option
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickNetworkSpeedFee (page) {
    await page.waitForSelector('#send_network_speed', { visible: true })
    await page.click('#send_network_speed')
    await page.waitForSelector('#average', { visible: true })
  }
}

module.exports = SendPage
