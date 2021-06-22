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
}

module.exports = HomePage
