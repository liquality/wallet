const TestUtil = require('../utils/TestUtils')
const testUtil = new TestUtil()

const puppeteer = require('puppeteer')
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
    if (!password) {
      return Promise.reject(new Error('Password is required'))
    }
    try {
      await page.waitForSelector('#password', { visible: true, timeout: 60000 })
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        await testUtil.takeScreenshot(page, 'password-screen-issue')
        expect(e, 'password screen not loaded').equals(null)
      }
    }
    await page.type('#password', password)
    await page.type('#confirmPassword', password)
    // Click next button
    await page.click('#next_button')
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
  async ClickUnlock (page, password) {
    // unlock
    await page.type('#password', password)
    await page.click('#unlock_button')
    // overview page after unlock
    await page.waitForSelector('#overview', { visible: true, timeout: 60000 })
    console.log('User successfully loggedIn after unlock')
  }

  /**
   * Click on Forgot password? Import with seed phrase.
   * @param page
   * @returns {Promise<void>}
   * @constructor
   */
  async ClickOnForgotPassword (page) {
    const forgotPassword = await page.waitForSelector('#forgot_password_import_seed', { visible: true })
    await forgotPassword.click()
    await page.waitForSelector('#terms_privacy_accept_button', { visible: true })
  }
}

module.exports = PasswordPage
