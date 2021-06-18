const crypto = require('crypto')

class TestUtils {
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
}

module.exports = TestUtils
