const expect = require('chai').expect

class TransactionDetailsPage {
  /**
   * Transaction Details - SENT AMOUNT validation.
   * @param page
   * @param amount
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateSentAmount (page, amount) {
    await page.waitForSelector('#transaction_detail_sent_amount', { visible: true })
    const sentAmount = await page.$eval('#transaction_detail_sent_amount', el => el.innerText)
    expect(sentAmount.toString().trim()).equals(amount)
  }

  /**
   * Transaction Details - SENT To href link domain.
   * @param page
   * @param domain
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateSentToLink (page, domain) {
    await page.waitForSelector('#transaction_details_send_to_link', { visible: true })
    const sedToHrefLink = await page.$eval('#transaction_details_send_to_link', el => el.href)
    console.log(sedToHrefLink)
    expect(sedToHrefLink).contain(domain)
  }

  /**
   * Transaction Details - SENT Network Speed & Fee
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateNetworkSpeedFee (page) {
    await page.waitForSelector('#transaction_details_network_speed_fee', { visible: true })
    const sendNetworkSpeedFee = await page.$eval('#transaction_details_network_speed_fee', el => el.innerText)
    console.log(sendNetworkSpeedFee)
  }

  /**
   * Transaction Details - SENT Date & Time.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateTime (page) {
    await page.waitForSelector('#transaction_details_date_time', { visible: true })
  }

  /**
   * Transaction Details - Status of the transaction.
   * @param page
   * @returns {Promise<void>}
   */
  async ValidateStatus (page) {
    await page.waitForSelector('#transaction_details_status', { visible: true })
  }

  /**
   * Transaction Details - Transaction ID href link.
   * @param page
   * @param domain
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateTransactionIDLink (page, domain) {
    await page.waitForSelector('#transaction_details_transaction_id', { visible: true })
    const transactionIdHrefLink = await page.$eval('#transactionLink', el => el.href)
    expect(transactionIdHrefLink).contain(domain)
    console.log(transactionIdHrefLink)
  }
}

module.exports = TransactionDetailsPage
