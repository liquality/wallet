const TestUtil = require('../utils/TestUtils')
const { expect } = require('chai')

const testUtil = new TestUtil()

class ConnectionPage {
  /**
   * Click on Chain
   * @param page
   * @param chain - chain name
   * @returns {Promise<void>}
   * @constructor
   * @example SelectAccount(page,'BITCOIN')
   */
  async selectAccount (page, chain, expectedAccounts) {
    try {
      await page.waitForSelector('#next_button', { visible: true, timeout: 90000 })
      await page.waitForSelector('#dropdown-item', { visible: true })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'connection-screen-not-loading-issue')
      expect(e, 'Connection window is not loading ...').equals(null)
    }

    if (chain !== 'ETHEREUM') {
      await page.click('#dropdown-item')

      try {
        await page.waitForSelector(`#${chain.toLowerCase()}_web_network`, { visible: true, timeout: 3000 })
      } catch (e) {
        await testUtil.takeScreenshot(page, 'connection-screen-chain-selector-issue')
        expect(e, 'Chain selector does not appear in connection window ...').equals(null)
      }

      await page.click(`#${chain.toLowerCase()}_web_network`)
    }

    if (expectedAccounts) {
      const accounts = await page.$$(`#${chain}`)
      expect(accounts.length, `List should include ${expectedAccounts} accounts`).to.equals(expectedAccounts)
    }

    await page.click(`#${chain}`)
    await page.click('#next_button').catch(e => e)

    try {
      await page.waitForSelector('#connect_request_button', { visible: true, timeout: 3000 })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'connection-screen-confirm-issue')
      expect(e, 'Confirm button does not appear in connection window ...').equals(null)
    }
    await page.click('#connect_request_button').catch(e => e)
  }
}

module.exports = ConnectionPage
