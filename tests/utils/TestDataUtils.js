const Wallet = require('ethereumjs-wallet')

class TestDataUtils {
  /**
   * Generate random ETH address.
   * @returns {string}
   */
  getRandomEthereumAddress () {
    const EthWallet = Wallet.default.generate()
    return EthWallet.getAddressString()
  }
}

module.exports = TestDataUtils
