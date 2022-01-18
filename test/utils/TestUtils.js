const crypto = require('crypto')

class TestUtils {
  /**
   * Get Chrome options
   * @returns {{slowMo: number, headless: boolean, args: string[], executablePath: string}}
   */
  getChromeOptions () {
    return {
      slowMo: 20,
      headless: false,
      executablePath: process.env.PUPPETEER_EXEC_PATH, // set by docker container
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--font-render-hinting=none',
        '--window-size=1920,1080',
        '--disable-notifications',
        '--disable-extensions-except=' + this.extensionPathBuildPath,
        '--load-extension=' + this.extensionPathBuildPath
      ],
      defaultViewport: null
    }
  }

  /**
   * Generate external ID
   * @param absolutePath - extension dir path.
   * @returns {string}
   */
  generateExtensionId (absolutePath) {
    const hash = crypto.createHash('sha256').update(absolutePath, 'utf8').digest().toString('hex')

    const chars = []

    for (const char of hash) {
      const resultNumber = 'a'.charCodeAt(0) + parseInt(char, 16)
      const character = String.fromCharCode(resultNumber)
      chars.push(character)
    }

    return chars.slice(0, 32).join('')
  }

  /**
   * Generate Extension build path.
   * @returns {string} - extension dist path.
   */
  get extensionPathBuildPath () {
    return require('path').join(__dirname, '..', '..', 'dist')
  }

  /**
   * Generate Extension Id.
   * @returns {string} - extension id.
   */
  get extensionId () {
    return this.generateExtensionId(this.extensionPathBuildPath)
  }

  /**
   * Get extension index.html URL
   * @returns {string} - URL
   */
  get extensionRootUrl () {
    const id = this.extensionId
    return `chrome-extension://${id}/index.html#/`
  }

  /**
   * Take screenshots on failures.
   * @param page
   * @param screenshotName
   * @returns {Promise<void>}
   */
  async takeScreenshot (page, screenshotName) {
    const ts = Math.round((new Date()).getTime() / 1000)
    await page.screenshot({ path: `screenshots/${screenshotName}-${ts}.png`, fullscreen: true })
  }
}

module.exports = TestUtils
