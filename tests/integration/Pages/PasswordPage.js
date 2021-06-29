const chalk = require('chalk')
const expect = require('chai').expect

class PasswordPage {
  /**
   * Enter password and submit details.
   * @param page
   * @param password
   * @returns {Promise<void>}
   * @constructor
   */
  async SubmitPasswordDetails (page, password) {
    await page.waitForSelector('#password', { visible: true })
    await page.type('#password', password)
    await page.type('#confirmPassword', password)
    await page.click('#next_button')
    console.log(chalk.green('User submit the password details'))
  }

  /**
   * Enter Password details
   * @param page
   * @param password
   * @param confirmPassword
   * @returns {Promise<void>}
   * @constructor
   */
  async EnterPasswordDetails (page, password, confirmPassword) {
    await page.waitForSelector('#password', { visible: true })
    await page.type('#password', password)
    await page.type('#confirmPassword', confirmPassword)
  }

  /**
   * Validate Next submit button is disabled
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ValidateSubmitPasswordDisabled (page) {
    const isNextButtonDisabled = await page.$('#next_button[disabled]')
    expect(isNextButtonDisabled, 'Next Button should be disabled if password length ' +
      'is less that 8 characters')
      .not.to.equal(null)
  }

  /**
   * Unlock the wallet.
   * @param page
   * @param password
   * @returns {Promise<void>}
   */
  async clickUnlock (page, password) {
    // unlock
    await page.type('#password', password)
    await page.click('#unlock_button')
    // overview page after unlock
    await page.waitForSelector('#overview', {
      visible: true
    })
    console.log('User successfully loggedIn after unlock')
  }
}

module.exports = PasswordPage
