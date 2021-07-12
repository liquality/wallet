const log = console.log
const chalk = require('chalk')

class HomePage {
  /**
   * Accept Terms & Privacy.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnAcceptPrivacy (page) {
    // Accept terms
    await page.waitForSelector('#terms_privacy_accept_button', {
      visible: true
    })
    await page.click('#terms_privacy_accept_button')
    log(chalk.green('User click on Terms & Privacy accept option'))
  }

  /**
   * Click on Create New wallet option.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnCreateNewWallet (page) {
    await page.waitForSelector('#create_new_wallet_option', { visible: true })
    await page.click('#create_new_wallet_option')
    log(chalk.greenBright('User click on create new wallet option'))
  }

  /**
   * Click on Import wallet Option from home screen.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnImportWallet (page) {
    const importWithSeedOptionElement = await page.waitForSelector('#import_with_seed_phrase_option', { visible: true })
    await importWithSeedOptionElement.click()
    console.log('Import with seed phrase option has been displayed')
    await page.waitForSelector('#import-wallet_top', { visible: true })
  }

  /**
   * Enter seeds words
   * @param page
   * @param numberOfWords - Number of seed phrase words.
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterSeedWords (page, numberOfWords = 12) {
    await page.waitForSelector('#import-wallet_top', { visible: true })
    console.log('Import wallet page hase been loaded')

    // Get the existing SEED words as environment variables
    let words
    let TWENTY_FOUR_SEEDS
    let SEED_WORDS
    if (numberOfWords === 24) {
      TWENTY_FOUR_SEEDS = process.env.TWENTY_FOUR_SEEDS
      SEED_WORDS = TWENTY_FOUR_SEEDS
    } else {
      SEED_WORDS = process.env.SEED_WORDS
    }

    if (!SEED_WORDS) {
      throw new Error('Please provide SEED_WORDS (or) TWENTY_FOUR_SEEDS as environment variables')
    } else {
      words = SEED_WORDS.split(' ')
    }

    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < seedsWordsCount.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(words[i])
    }

    // Click on continue button
    await page.click('#import_wallet_continue_button')
    console.log('Import wallet continue button has been clicked')
  }
}

module.exports = HomePage
