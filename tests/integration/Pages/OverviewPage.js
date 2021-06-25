const chalk = require('chalk')
const expect = require('chai').expect

class OverviewPage {
  /**
   * Overview page loaded after user loggedIn.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async HasOverviewPageLoaded (page) {
    await page.waitForSelector('#overview', {
      visible: true
    })
    console.log(chalk.green('User logged successfully, overview page loaded'))
  }

  /**
   * Select Network from overview page
   * @param page
   * @param network - Network type
   * @returns {Promise<void>}
   * @constructor
   * @example - SelectNetwork(page,'testnet')
   */
  async SelectNetwork (page, network) {
    await page.click('#head_network')
    switch (network) {
      case 'testnet': {
        await page.waitForSelector('#testnet_network', { visible: true })
        console.log('user successfully logged in after import wallet')
        await page.click('#testnet_network')
        const overviewText = await page.$eval('.text-muted', el => el.innerText)
        expect(overviewText, 'Testnet overview header').contain('TESTNET')
        console.log('user successfully changed to TESTNET')
        break
      }

      case 'mainnet': {
        await page.waitForSelector('#mainnet_network', { visible: true })
        console.log('user successfully logged in after import wallet')
        await page.click('#mainnet_network')
        const overviewText = await page.$eval('.text-muted', el => el.innerText)
        expect(overviewText, 'Mainnet overview header').contain('MAINNET')
        console.log('user successfully changed to MAINET')
        break
      }

      default:
        throw Error(`Unsupported Network: ${network}`)
    }
  }

  /**
   * Get Total assets from overview page.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetTotalAssets (page) {
    const assetsElement = await page.$('#total_assets')
    return (await assetsElement.getProperty('innerText')).jsonValue()
  }

  /**
   * Get Total Liquidity from wallet.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetTotalLiquidity (page) {
    // Check the Total amount - 10s wait to load amount
    await page.waitForTimeout(10000)
    return await page.$eval('.wallet-stats_total', el => (el.innerText).replace(/[.,\s]/g, ''))
  }

  /**
   * Get Currency from overview.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetCurrency (page) {
    return await page.$eval('.wallet-stats', el => el.innerText)
  }

  /**
   * Click SEND option from Overview page.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickSend (page) {
    await page.waitForSelector('#send_action', { visible: true })
    await page.click('#send_action')
  }

  /**
   * Click on SWIPE button from overview.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickSwipe (page) {
    await page.waitForSelector('#swap_action', { visible: true })
    await page.click('#swap_action')
    await page.waitForSelector('#search_for_a_currency_search', { visible: true })
  }
}

module.exports = OverviewPage
