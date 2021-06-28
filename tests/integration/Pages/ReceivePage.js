const expect = require('chai').expect
const assert = require('chai').assert

class ReceivePage {
  async CheckReceiveAddresses (page) {
    await page.waitForSelector('.receive_address:not(:empty)')
    const addressText = await page.$eval('#receive_address', (el) => el.textContent.trim())
    expect(addressText, 'Receive address must be string and not undefined')
      .to.be.a('string')
    assert.isNotNull(addressText, 'Receive address not null')
  }

  async HasQRCodeDisplayed (page) {
    // QR code has been loaded
    await page.waitForSelector('.receive_qr', { visible: true })
  }

  async CheckReceiveURL (page) {
    await page.waitForSelector('#receive_url', { visible: true })
  }

  async ClickDone (page) {
    await page.click('#done_button')
  }

  async ClickCopyAddress (page) {
    await page.click('#copy_address_button')
  }
}

module.exports = ReceivePage
