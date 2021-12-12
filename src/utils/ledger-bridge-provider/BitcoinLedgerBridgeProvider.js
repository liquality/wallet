import { BitcoinLedgerProvider } from '@liquality/bitcoin-ledger-provider'
import { fromBase58 } from 'bip32'
// import { bitcoin } from '@liquality/types'
// import { address } from 'bitcoinjs-lib'

export class BitcoinLedgerBridgeProvider extends BitcoinLedgerProvider {
  _ledgerApp
  _xPub

  constructor (
    { network, Transport, baseDerivationPath, addressType },
    ledgerApp,
    xPub
  ) {
    super({
      network,
      Transport,
      baseDerivationPath,
      addressType
    })
    this._ledgerApp = new Proxy(ledgerApp, { get: this.errorProxy.bind(this) })
    this._xPub = xPub
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }

  async _getBaseDerivationNode () {
    if (!this._baseDerivationNode) {
      this._baseDerivationNode = fromBase58(
        this._xPub, this._network
      ).derivePath(this.baseDerivationPath)
    }

    return this._baseDerivationNode
  }

  async baseDerivationNode () {
    if (this._xPub) {
      return this._getBaseDerivationNode()
    }
    return super.baseDerivationNode()
  }
}
