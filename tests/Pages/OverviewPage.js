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
   * Check Send,swipe and receive options have been displayed.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateSendSwipeReceiveOptions (page) {
    // check Send & Swap & Receive options have been displayed
    await page.waitForSelector('#send_action', {
      visible: true
    })
    await page.waitForSelector('#swap_action', {
      visible: true
    })
    await page.waitForSelector('#receive_action', {
      visible: true
    })
  }

  /**
   * Click on Chain
   * @param page
   * @param chain - chain name
   * @returns {Promise<void>}
   * @constructor
   * @example SelectChain(page,'BITCOIN')
   */
  async SelectChain (page, chain) {
    await page.waitForSelector('#assert_list_item', { visible: true })
    const assertListItems = await page.$$('#assert_list_item')
    switch (chain) {
      case 'BITCOIN': {
        await page.waitForSelector(`#${chain}`, { visible: true })
        await page.click(`#${chain}`)
        break
      }

      case 'DAI':
      case 'ETH': {
        const eth = await page.waitForSelector('#ETHEREUM', { visible: true })
        await eth.click()
        await page.waitForSelector(`#${chain}`, { visible: true })
        await page.click(`#${chain}`)
        break
      }

      case 'BSC': {
        await page.waitForSelector(`#${chain}`, { visible: true })
        await page.click(`#${chain}`)
        const eth = await page.waitForSelector('#BNB', { visible: true })
        await eth.click()
        break
      }

      case 'NEAR': {
        await page.waitForSelector(`#${chain}`, { visible: true })
        await page.click(`#${chain}`)
        const eth = await page.waitForSelector('#NEAR', { visible: true })
        await eth.click()
        break
      }

      case 'ARBETH': {
        const eth = await page.waitForSelector('#ARBITRUM', { visible: true })
        await eth.click()
        await page.waitForSelector(`#${chain}`, { visible: true })
        await page.click(`#${chain}`)
        break
      }

      case 'SOV':
      case 'RBTC': {
        const eth = await page.waitForSelector('#RSK', { visible: true })
        await eth.click()
        await page.waitForSelector(`#${chain}`, { visible: true })
        await page.click(`#${chain}`)
        break
      }

      default:
        await assertListItems[0].click()
        await page.click('#' + chain)
    }
    await page.waitForSelector('.account-container_balance_code', { visible: true })
  }

  /**
   * Click Receive button.
   * @param page
   * @param chainCode - chainCode
   * @returns {Promise<void>}
   * @constructor
   * @example SelectChain(page,'BTC')
   */
  async ClickChainReceive (page, chainCode) {
    await page.waitForSelector('.account-container_balance_code', { visible: true })
    const code = await page.$eval('.account-container_balance_code', el => el.textContent)
    expect(code).equals(chainCode)
    // Click Receive button
    await page.click('#receive')
    console.log(chalk.green('User clicked on receive option for ' + chainCode))
    await page.waitForSelector('.receive_address', { visible: true })
  }

  /**
   * Check asset account details overview
   * @param page
   * @param assertCode
   * @returns {Promise<void>}
   * @constructor
   */
  async CheckAssertOverviewDetails (page, assertCode) {
    await page.waitForSelector('.account-container_balance_code', { visible: true })
    const code = await page.$eval('.account-container_balance_code', el => el.textContent)
    expect(code).equals(assertCode)
    // Check assert account title
    const title = await page.$eval('.account-title', el => el.textContent)
    expect(title).contains(assertCode)
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

  /**
   * Click on Lock option.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickLock (page) {
    // Lock
    await page.waitForSelector('#burger_icon_menu', { visible: true })
    await page.click('#burger_icon_menu')
    await page.waitForSelector('#lock', { visible: true })
    await page.click('#lock')
    console.log(chalk.green('User clicked on lock option'))
    await page.waitForSelector('#password', { visible: true })
  }
}

module.exports = OverviewPage
