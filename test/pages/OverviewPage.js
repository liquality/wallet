const TestUtil = require('../utils/TestUtils')

const testUtil = new TestUtil()
const puppeteer = require('puppeteer')
const expect = require('chai').expect
const assert = require('chai').assert

class OverviewPage {
  /**
   * Overview page loaded after user loggedIn.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async HasOverviewPageLoaded(page) {
    try {
      await page.waitForSelector('#burger_icon_menu', {
        visible: true,
        timeout: 120000
      })
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        await testUtil.takeScreenshot(page, 'overview-page-loading-issue')
        expect(e, 'Hamburger icon loading issue after user enter password').equals(null)
      }
    }
  }

  /**
   * Select Network from overview page
   * @param page
   * @param network - Network type default: testnet
   * @returns {Promise<void>}
   * @constructor
   * @example - SelectNetwork(page,'testnet')
   */
  async SelectNetwork(page, network = 'testnet') {
    await page.waitForSelector('#head_network', { visible: true })
    let overviewText

    switch (network) {
      case 'testnet':
        await page.click('#head_network', { delay: 100 })
        await page.waitForSelector('#testnet_network', { visible: true })
        console.log('user successfully logged in after import wallet')
        await page.click('#testnet_network', { delay: 100 })
        await page.waitForSelector('#active_network', { visible: true })
        overviewText = await page.$eval('#active_network', (el) => el.innerText)
        expect(overviewText, 'switch to testnet failed').contain('TESTNET')
        console.log('user successfully changed to TESTNET')
        break

      case 'mainnet':
        await page.waitForSelector('#active_network', { visible: true })
        overviewText = await page.$eval('#active_network', (el) => el.innerText)
        expect(overviewText, 'mainnet change failed').contain('MAINNET')
        console.log('user successfully changed to MAINNET')
        break

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
  async CloseWhatsNewModal(page) {
    await page.waitForSelector('#wats_new_close_btn', {
      visible: true,
      timeout: 180000
    })
    await page.click('#wats_new_close_btn')
    console.log("Wat's new Modal closed")
  }

  /**
   * Check Send,swipe and receive options have been displayed.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateSendSwipeReceiveOptions(page) {
    // check Send & Swap & Receive options have been displayed
    try {
      // TODO: Most of the times overview screen takes more time to load total assets & fiat values
      await page.waitForSelector('#send_action', { visible: true, timeout: 240000 })
    } catch (e) {
      await testUtil.takeScreenshot(page, 'overview-page-loading-issue')
      expect(e, "Overview page still Loading.....didn't load send/receive/swap option").equals(null)
    }

    await page.waitForSelector('#send_action', {
      visible: true,
      timeout: 60000
    })
    console.log('SEND button has been displayed')
    await page.waitForSelector('#swap_action', {
      visible: true,
      timeout: 60000
    })
    console.log('SWAP button has been displayed')
    await page.waitForSelector('#receive_action', {
      visible: true,
      timeout: 60000
    })
    console.log('RECEIVE button has been displayed')
  }

  /**
   * Select Native or ERC20 tokens from overviewPage
   * @param page
   * @param assetName - asset name
   * @returns {Promise<void>}
   * @constructor
   * @example SelectChain(page,'BITCOIN')
   */
  async SelectAssetFromOverview(page, assetName) {
    const elementVisibleTimeout = 60000
    try {
      await page.waitForSelector('#asserts_tab', { visible: true, timeout: elementVisibleTimeout })
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        await testUtil.takeScreenshot(page, `click-asset-from-${assetName}-overview-issue`)
        expect(e, 'Overview clicking on particular asset issue!').equals(null)
      }
    }
    switch (assetName) {
      case 'BTC': {
        await page.waitForSelector('#BITCOIN', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click('#BITCOIN')
        break
      }

      case 'DAI':
      case 'USDC':
      case 'ETH': {
        const eth = await page.waitForSelector('#ETHEREUM', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await eth.click()
        await page.waitForSelector(`#${assetName}`, {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click(`#${assetName}`)
        break
      }

      case 'BNB': {
        const bsc = await page.waitForSelector('#BSC', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await bsc.click()
        await page.waitForSelector(`#${assetName}`, {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click(`#${assetName}`)
        break
      }

      case 'NEAR': {
        await page.waitForSelector(`#${assetName}`, {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click(`#${assetName}`)
        const near = await page.waitForSelector('#NEAR', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await near.click()
        break
      }

      case 'ARBETH': {
        const arbeth = await page.waitForSelector('#ARBITRUM', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await arbeth.click()
        await page.waitForSelector(`#${assetName}`, {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click(`#${assetName}`)
        break
      }

      case 'AVAX': {
        const eth = await page.waitForSelector('#AVALANCHE', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await eth.click()
        await page.waitForSelector(`#${assetName}`, {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click(`#${assetName}`)
        break
      }

      case 'SOV':
      case 'FISH':
      case 'RBTC': {
        const rsk = await page.waitForSelector('#RSK', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await rsk.click()
        await page.waitForSelector(`#${assetName}`, {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click(`#${assetName}`)
        break
      }

      case 'MATIC':
      case 'PUSDT':
      case 'PUSDC':
      case 'PWETH': {
        const polygon = await page.waitForSelector('#POLYGON', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await polygon.click()
        await page.waitForSelector(`#${assetName}`, {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click(`#${assetName}`)
        break
      }

      case 'SOL': {
        const solana = await page.waitForSelector('#SOLANA', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await solana.click()
        await page.waitForSelector(`#${assetName}`, {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click(`#${assetName}`)
        break
      }

      case 'LUNA':
      case 'ANC':
      case 'UST': {
        const terra = await page.waitForSelector('#TERRA', {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await terra.click()
        // click on token
        await page.waitForSelector(`#${assetName}`, {
          timeout: elementVisibleTimeout,
          visible: true
        })
        await page.click(`#${assetName}`)
        break
      }

      default:
        throw Error(`Unsupported chain: ${assetName}`)
    }
    await page.waitForSelector('.account-container_balance_code', { visible: true, timeout: 60000 })
    await page.waitForSelector('#refresh-icon', { visible: true })
  }
  /**
   * Validate view explorer href for each assert on overview page.
   * @param page
   * @param asset {string} - assert symbol.
   * @returns {Promise<void>}
   * @constructor
   */
  async HasViewExplorerDisplayed(page, asset) {
    const id = `#${asset}_view_in_explorer`
    await page.waitForSelector(id, { visible: true })
    const explorerLink = await page.$eval(id, (el) => el.href)
    expect(explorerLink).contains('https://')
    console.log('View explorer link:' + explorerLink)
  }

  /**
   * Click Receive button.
   * @param page
   * @param chainCode - chainCode
   * @returns {Promise<void>}
   * @constructor
   * @example SelectChain(page,'BTC')
   */
  async ClickChainReceive(page, chainCode) {
    await page.waitForSelector('.account-container_balance_code', { visible: true })
    const code = await page.$eval('.account-container_balance_code', (el) => el.textContent)
    expect(code).equals(chainCode)
    // Click Receive button
    await page.click(`#${chainCode}_receive_button`)
    await page.waitForSelector('.receive_address', { visible: true })
  }

  /**
   * Check asset account details overview
   * @param page
   * @param assertCode
   * @returns {Promise<void>}
   * @constructor
   */
  async CheckAssertOverviewDetails(page, assertCode) {
    await page.waitForSelector('.account-container_balance_code', { visible: true })
    const code = await page.$eval('.account-container_balance_code', (el) => el.textContent)
    expect(code, 'Assert Code wrong').equals(assertCode)
    // Check assert account title
    const title = await page.$eval('.account-title', (el) => el.textContent)
    expect(title).contains(assertCode)
    // Check fiat balance not NaN
    expect(
      await page.$eval('.account-container_balance_fiat', (el) => el.textContent),
      'Balance $ not be NaN'
    ).not.equals('NaN')
    // account balance is not NaN
    expect(
      await page.$eval('.account-container_balance_value', (el) => el.textContent),
      'Balance value not be NaN'
    ).not.equals('NaN')
  }

  /**
   * Check asset balance for each assert after user select it.
   * @param page
   * @param assetCode
   * @returns {Promise<void>}
   */
  async checkAssetBalance(page, assetCode) {
    await page.waitForSelector('.account-container_balance_code', { visible: true })
    // account balance is not NaN
    expect(
      await page.$eval(`#${assetCode}_balance_value`, (el) => el.textContent),
      `${assetCode} Balance value is NaN`
    ).not.equals('NaN')
    // account balance is not 0
    expect(
      await page.$eval(`#${assetCode}_balance_value`, (el) => el.textContent),
      `${assetCode} Balance value is 0`
    ).not.equals(0)
  }

  /**
   * Validate total asserts from overview page.
   * @param page
   * @param newWallet
   * @returns {Promise<*>}
   * @constructor
   */
  async ValidateTotalAssets(page, newWallet = true) {
    let chainNames = []

    let chains = await page.$$('.wallet-tab-content > div > div')
    for (let i = 0; i < chains.length; i++) {
      const assertName = await (await chains[i].getProperty('id')).jsonValue()
      chainNames.push(assertName)
    }
    console.log(`Total assets: ${chainNames.length}`)
    console.log(`Total assets: ${chainNames}`)

    const assets = newWallet ? 11 : 12
    await page.waitForSelector('#total_assets', { timeout: 60000 })
    const assetsCount = await page.$eval('#total_assets', (el) => el.textContent)
    expect(
      assetsCount,
      `Total assets should be ${assets} on overview page but we got ${chainNames}`
    ).contain(`${assets} Assets`)
  }

  /**
   * Get Total assets count from overview page.
   * @param page
   * @returns {Promise<number>}
   */
  async getTotalAssets(page) {
    let chainNames = []

    let chains = await page.$$('.wallet-tab-content > div > div')
    for (let i = 0; i < chains.length; i++) {
      const assertName = await (await chains[i].getProperty('id')).jsonValue()
      chainNames.push(assertName)
    }
    return chainNames.length
  }

  /**
   * Get total assets count from overview page.
   * @param page
   * @returns {Promise<number>}
   */
  async getTotalAssetsFromOverview(page) {
    await page.waitForSelector('#total_assets', { timeout: 60000 })
    const assetsCount = await page.$eval('#total_assets', (el) => el.textContent)
    return parseInt(assetsCount.replace(/[^\d.-]/g, ''))
  }

  /**
   * Get Total Liquidity from wallet.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetTotalLiquidity(page) {
    // Check the Total amount - 10s wait to load amount
    await page.waitForSelector('.wallet-stats_total', { timeout: 30000 })
    let walletTotal = await page.$eval('.wallet-stats_total', (el) =>
      el.innerText.replace(/[.,\s]/g, '')
    )
    if (walletTotal.includes('NaN')) {
      assert.fail('Total Liquidity is NaN')
    }
    if (parseInt(walletTotal, 10) === 0) {
      console.log('Total Liquidity is 0 so we will wait for 5s to load amount')
      await page.waitForTimeout(5000)
    }
    return parseInt(walletTotal, 10)
  }

  /**
   * Get Currency from overview.
   * @param page
   * @returns {Promise<*>}
   * @constructor
   */
  async GetCurrency(page) {
    return await page.$eval('.wallet-stats', (el) => el.innerText)
  }

  /**
   * Click SEND option from Overview page.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickSend(page) {
    try {
      await page.waitForSelector('#send_action', { visible: true, timeout: 180000 })
    } catch (e) {
      const ts = Math.round(new Date().getTime() / 1000)
      await page.screenshot({ path: `screenshots/send-button-not-loaded-${ts}.png` })
      expect(e, 'Send button not loaded....').equals(null)
    }

    await page.click('#send_action')
  }

  /**
   * Click on SWIPE button from overview.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickSwipe(page) {
    await page.waitForSelector('#swap_action', { visible: true })
    await page.click('#swap_action')
    console.log('User clicked on SWAP button from overview page')
    await page.waitForSelector('#search_for_a_currency_search', { visible: true })
  }

  /**
   * Click on Lock option.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickLock(page) {
    // Lock
    await page.waitForSelector('#burger_icon_menu', { visible: true })
    await page.click('#burger_icon_menu')
    await page.waitForSelector('#lock', { visible: true })
    await page.click('#lock')
    await page.waitForSelector('#password', { visible: true })
  }

  /**
   * Get Assert address from overview page
   * @param page
   * @param assertName - ETHEREUM, BITCOIN
   * @returns {Promise<void>}
   * @constructor
   */
  async GetAssertAddress(page, assertName) {
    let assertAddress

    console.log(`trying to get ${assertName} address`)

    try {
      await page.waitForSelector(`#${assertName}`, { visible: true })
      const $parent = await page.$(`#${assertName}`)
      await page.waitForTimeout(5000)
      assertAddress = await $parent.$eval('#assert_address', (el) => el.textContent.trim())
      if (assertAddress === "''" || assertAddress === '""') {
        await page.reload()
      }
      assertAddress = await $parent.$eval('#assert_address', (el) => el.textContent.trim())
      expect(assertAddress, `${assertName} address is empty on overview page!`).to.not.equals("''")
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        await testUtil.takeScreenshot(page, 'get-address-from-overview-page')
        expect(e, `${assertName} get address from overview page should not empty!`).equals(null)
      }
    }
    return assertAddress
  }

  /**
   * Click on Hamburger icon.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnBurgerIcon(page) {
    // Click on Backup seed from Burger Icon menu
    await page.waitForSelector('#burger_icon_menu', { visible: true })
    await page.click('#burger_icon_menu')
  }

  /**
   * Click on Settings under menu items.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async SelectSettings(page) {
    const settings = await page.waitForSelector('#settings', { visible: true })
    await settings.click()
    await page.waitForSelector('#settings_item_default_wallet', { visible: true })
  }

  /**
   * Click Manage asset option under burger menu.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickManageAssets(page) {
    await this.ClickOnBurgerIcon(page)
    // Click Manage Assets
    await page.waitForSelector('#manage_assets', { visible: true })
    await page.click('#manage_assets')
    // click on add custom token
    await page.waitForSelector('#add_custom_token', { visible: true })
  }

  /**
   * Click on Add Custom token from setting screen.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickAddCustomToken(page) {
    await this.ClickOnBurgerIcon(page)
    // Click Manage Assets
    await page.waitForSelector('#manage_assets', { visible: true })
    await page.click('#manage_assets')
    // click on add custom token
    await page.waitForSelector('#add_custom_token', { visible: true })
    await page.click('#add_custom_token')
  }

  /**
   * Click on Manage Accounts from Overview page.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnManageAccounts(page) {
    await page.waitForSelector('#burger_icon_menu', { visible: true })
    await page.click('#burger_icon_menu')
    // Click Manage Accounts
    await page.waitForSelector('#manage_accounts', { visible: true })
    await page.click('#manage_accounts')
    await page.waitForSelector('#create-account-plus-icon-bitcoin', { visible: true })
  }

  /**
   * Toggle on Web3 Wallet from setting screen, by default on
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async CheckWeb3ToggleOn(page) {
    await this.ClickOnBurgerIcon(page)
    await this.SelectSettings(page)
    // toggle web3 wallet option
    let defaultWeb3Toggle = await page.$eval('#default_web3_wallet_toggle_button > label', (el) =>
      el.getAttribute('class')
    )
    expect(defaultWeb3Toggle, 'Default Web3 Wallet toggle should be on').to.contains('toggled')
  }

  /**
   * Click on version under settings.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnVersionButton(page) {
    await this.ClickOnBurgerIcon(page)
    await this.SelectSettings(page)
    await page.click('#settings_app_version')
  }

  /**
   * Toggle on/off experiment option.
   * @param page
   * @param option
   * @returns {Promise<void>}
   * @constructor
   */
  async ToggleExperimentButton(page, option) {
    await this.ClickOnVersionButton(page)
    await page.waitForSelector(`#${option}`)
    await page.click(`#${option}`)
  }

  /**
   * Click on Manage assets from menu.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnManageAssets(page) {
    await this.ClickOnBurgerIcon(page)
    // Click Manage Assets
    await page.waitForSelector('#manage_assets', { visible: true })
    await page.click('#manage_assets')
    console.log('User clicked on Manage Assets')
  }
}


module.exports = OverviewPage
