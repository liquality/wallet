const { expect } = require('chai')

class AddCustomTokenPage {
  /**
   * Select Chain from dropdown.
   * @param page
   * @param chaiName
   * @returns {Promise<void>}
   * @constructor
   */
  async SelectChainDropdown (page, chaiName) {
    await page.waitForSelector('#contractAddress', { visible: true })
    await page.waitForSelector('#select_chain_dropdown', { visible: true })
    await page.click('#select_chain_dropdown')
    await page.waitForSelector(`#${chaiName}_chain`, { visible: true })
    await page.click(`#${chaiName}_chain`)
  }

  /**
   * Enter Token address in input.
   * @param page
   * @param tokenAddress
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterCustomTokenAddress (page, tokenAddress) {
    await page.type('#contractAddress', tokenAddress)
    console.log(('User enter token address as'), tokenAddress)
    await page.click('#tokenSymbol')
    await page.click('#name')
    await page.waitForTimeout(10000)
  }

  /**
   * Get the token fetched detaila after coingecko API returns.
   * @param page
   * @returns {Promise<{tokenSymbol: *, tokenName: *, tokenDecimal: *}>}
   * @constructor
   *
   */
  async GetTokenDetails (page) {
    // Check Token name
    const name = await page.$eval('#name', el => el.value)
    // Check Token Symbol
    const symbol = await page.$eval('#tokenSymbol', el => el.value)
    // Check Token Symbol
    const decimal = await page.$eval('#decimals', el => el.value)
    return {
      tokenName: name,
      tokenSymbol: symbol,
      tokenDecimal: decimal
    }
  }

  /**
   * Click ADD token submit button.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async AddTokenButton (page) {
    // Click on Add Token button
    await page.click('#add_token_button')
  }

  /**
   * Validate token is already added to the wallet in the past.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateTokenAlreadyAdded (page) {
    await page.waitForSelector('#token_with_this_symbol_exits', { visible: true })
    // Add token button is disabled
    const addTokenDetails = await page.$eval('#add_token_button', el => el.getAttribute('disabled'))
    expect(addTokenDetails).to.eq('disabled')
  }

  /**
   * Check Add token button is Disabled.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async DisabledAddTokenButton (page) {
    // Add token button is disabled
    const addTokenDetails = await page.$eval('#add_token_button', el => el.getAttribute('disabled'))
    expect(addTokenDetails).to.eq('disabled')
  }

  /**
   * Remove custom token after added.
   * @param page
   * @param tokenSymbol
   * @returns {Promise<void>}
   * @constructor
   */
  async RemoveCustomToken (page, tokenSymbol) {
    // Remove token
    await page.waitForSelector('#' + tokenSymbol + '_remove_custom_token', { visible: true })
    await page.click('#' + tokenSymbol + '_remove_custom_token')
    await page.type('#search_for_an_assert_input', tokenSymbol)
    await page.waitForSelector('.manage-assets_customText', { visible: true })
    console.log(('Remove token clicked!'))
  }
}

module.exports = AddCustomTokenPage
