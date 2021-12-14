import { BitcoinLedgerProvider } from '@liquality/bitcoin-ledger-provider'
import { fromBase58 } from 'bip32'

export class BitcoinLedgerBridgeProvider extends BitcoinLedgerProvider {
  _ledgerApp
  _xPub
  _index

  constructor (
    { network, Transport, baseDerivationPath, addressType, xPub, ledgerApp }
  ) {
    super({
      network,
      Transport,
      baseDerivationPath,
      addressType
    })
    this._ledgerApp = new Proxy(ledgerApp, { get: this.errorProxy.bind(this) })
    this._xPub = xPub
    this._index = parseInt(baseDerivationPath.split('/')[2].replace('\'', ''))
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }

  async getWalletPublicKey (path) {
    console.log('getWalletPublicKey', path)
    if (path in this._walletPublicKeyCache) {
      return this._walletPublicKeyCache[path]
    }

    let walletPublicKey
    if (this._xPub) {
      const index = parseInt(path.split('/')[2].replace('\'', ''))
      const derivationNode = fromBase58(
        this._xPub, this._network
      ).derive(index)

      const bitcoinAddress = this.getAddressFromPublicKey(derivationNode.publicKey)

      walletPublicKey = {
        bitcoinAddress,
        chainCode: derivationNode.chainCode.toString('hex'),
        publicKey: derivationNode.publicKey.toString('hex')
      }

      console.log('walletPublicKey', walletPublicKey)
    } else {
      walletPublicKey = await this._getWalletPublicKey(path)
    }

    this._walletPublicKeyCache[path] = walletPublicKey
    return walletPublicKey
  }
}
