const chalk = require('chalk')

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

}

module.exports = OverviewPage
