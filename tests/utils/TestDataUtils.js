const Wallet = require('ethereumjs-wallet')
const bitcoin = require('bitcoinjs-lib')
const bip39 = require('bip39')
const crypto = require('crypto')

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
        return this.getRandomBitcoinAddress()
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
   * Generate bitcoin address for testnet.
   * @returns {*}
   */
  getRandomBitcoinAddress () {
    const keyPair = bitcoin.ECPair.makeRandom()
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.testnet
    })
    return address
  }

  /**
   * Generate Random seed 12 words.
   * @returns {string}
   */
  getRandomSeedWords () {
    const randomBytes = crypto.randomBytes(16)
    return bip39.entropyToMnemonic(randomBytes.toString('hex'))
  }
}

module.exports = TestDataUtils
