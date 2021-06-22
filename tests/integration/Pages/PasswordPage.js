const chalk = require('chalk')

class PasswordPage {
  /**
   * Enter password and submit details.
   * @param page
   * @param password
   * @returns {Promise<void>}
   * @constructor
   */
  async SubmitPasswordDetails (page, password) {
    await page.type('#password', password)
    await page.type('#confirmPassword', password)
    await page.click('#next_button')
    console.log(chalk.green('User submit the password details'))
  }
}

module.exports = PasswordPage
