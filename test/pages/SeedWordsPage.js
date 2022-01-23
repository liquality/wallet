class SeedWordsPage {
  /**
   * Get Backup seed words 1,5 12 for next stage.
   * @param page
   * @returns {Promise<{seed1, seed5, seed12}>}
   * @constructor
   */
  async GetBackupSeedWords (page) {
    await page.waitForSelector('#backup-wallet_seed_wordlist', { visible: true })
    const allSeedPhases = await page.$$eval('#backup_seed_word', elements => elements.map(item => item.textContent))
    if (allSeedPhases.length !== 12) {
      throw new Error('Seed words not found')
    }

    const seed_one = allSeedPhases[0]
    const seed_five = allSeedPhases[4]
    const seed_twelve = allSeedPhases[11]

    return {
      seed1: seed_one,
      seed5: seed_five,
      seed12: seed_twelve
    }
  }

  /**
   * Click on Next button from back up your wallet screen
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnWalletNextButton (page) {
    await page.waitForSelector('#backup_your_wallet_next_button', { visible: true })
    await page.click('#backup_your_wallet_next_button') // Next
    console.log('Confirm Seed Phrase view has been loaded')
  }

  /**
   * Enter seed1, see5 and seed12 words.
   * @param page
   * @param seed1
   * @param seed5
   * @param seed12
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterSeedWords (page, seed1, seed5, seed12) {
    const timeout = 2000
    await page.type('#first_seed_word_input',seed1)
    await page.waitForTimeout(timeout)

    await page.type('#fifth_seed_word_input',seed5)
    await page.waitForTimeout(timeout)

    await page.type('#twelveWord_seed_word_input',seed12)
    await page.waitForTimeout(timeout)
  }

  /**
   * Continue button after enter seed(1,5,12) words
   * @param page - Confirm seed phrase.
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickContinueButton (page) {
    // continue button
    await page.waitForSelector('#seed_phrase_continue', { visible: true })
    await page.click('#seed_phrase_continue', { delay: 100 })
  }

  /**
   * Enter seed words while import wallet.
   * @param page
   * @param seedWords
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterImportSeedWords (page, seedWords) {
    if (!seedWords) {
      throw new Error('Please provide seed words')
    }
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < seedsWordsCount.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Click on continue button
    await page.click('#import_wallet_continue_button')
    console.log('Import wallet continue button has been clicked')
  }
}

module.exports = SeedWordsPage
