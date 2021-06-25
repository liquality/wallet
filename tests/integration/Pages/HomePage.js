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
   * Click on Import wallet Option from home screen.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnImportWallet (page) {
    const importWithSeedOptionElement = await page.waitForSelector('#import_with_seed_phrase_option', { visible: true })
    await importWithSeedOptionElement.click()
    console.log('Import with seed phrase option has been displayed')
  }

  /**
   * Enter seeds words
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterSeedWords (page) {
    await page.waitForSelector('#import-wallet_top', { visible: true })
    console.log('Import wallet page hase been loaded')
    // Get the existing SEED words as environment variables
    let words
    const SEED_WORDS = process.env.SEED_WORDS
    if (!SEED_WORDS) {
      throw new Error('Please provide SEED_WORDS as environment variables')
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
