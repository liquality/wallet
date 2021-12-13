const expect = require('chai').expect
const assert = require('chai').assert

class ReceivePage {
  /**
   * Check Receive address is not empty and its a string.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async CheckReceiveAddresses (page) {
    await page.waitForSelector('.receive_address:not(:empty)')
    const addressText = await page.$eval('#receive_address', (el) => el.textContent.trim())
    expect(addressText, 'Receive address must be string and not undefined')
      .to.be.a('string')
    assert.isNotNull(addressText, 'Receive address not null')
  }

  /**
   * Check receive QR code.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async HasQRCodeDisplayed (page) {
    await page.waitForSelector('.receive_qr', { visible: true, timeout: 60000 })
  }

  /**
   * Receive Url
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async CheckReceiveURL (page) {
    if (process.env.NODE_ENV !== 'mainnet') {
      await page.waitForSelector('#receive_url', {
        visible: true,
        timeout: 60000
      })
      const url = await page.$eval('#receive_url', (el) => el.textContent)
      console.log('receive address url:', url)
    }
    return null
  }

  async ClickDone (page) {
    await page.click('#done_button')
  }

  async ClickCopyAddress (page) {
    await page.click('#copy_address_button')
  }
}

module.exports = ReceivePage
