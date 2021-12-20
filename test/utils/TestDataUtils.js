const Wallet = require('ethereumjs-wallet')
const bitcoin = require('bitcoinjs-lib')
const bip39 = require('bip39')
const crypto = require('crypto')
const chains = require('@liquality/cryptoassets').chains

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

      case 'rsk': {
        return this.getRandomRSKAddress()
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
   * Generate random RSK address with EIP-1191 checksum
   * @param network - testnet/mainnet
   * @returns {string}
   */
  getRandomRSKAddress (network = 'testnet') {
    const EthWallet = Wallet.default.generate()

    return chains.rsk.formatAddress(EthWallet.getAddressString(), network)
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
