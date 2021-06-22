const Wallet = require('ethereumjs-wallet')
const Bitcoin = require('bitcoin-address-generator')

class TestDataUtils {
  /**
   * Generate Random address.
   * @param name - bitcoin name
   * @returns {string}
   */
  getRandomAddress (name) {
    switch (name) {
      case 'ethereum': {
        return this.getRandomEthereumAddress()
      }

      case 'bitcoin': {
        return this.getBitcoinAddress()
      }

      default:
        throw Error(`Unsupported chain: ${name}`)
    }
  }

  /**
   * Generate random ETH address.
   * @returns {string}
   */
  getRandomEthereumAddress () {
    const EthWallet = Wallet.default.generate()
    return EthWallet.getAddressString()
  }

  /**
   * Generate bitcoin address.
   * @returns {*}
   */
  getBitcoinAddress () {
    let addressNew
    Bitcoin.createWalletAddress(response => {
      console.log(response)
      addressNew = response.address
    })
    return addressNew
  }
}

module.exports = TestDataUtils
