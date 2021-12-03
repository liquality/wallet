import { BitcoinLedgerProvider } from '@liquality/bitcoin-ledger-provider'
import { fromBase58 } from 'bip32'

export class BitcoinLedgerBridgeProvider extends BitcoinLedgerProvider {
  _ledgerApp
  _xPub

  constructor ({
    network,
    Transport,
    baseDerivationPath,
    addressType
  },
  ledgerApp,
  xPub) {
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
    if (this._baseDerivationNode) return this._baseDerivationNode
    this._baseDerivationNode = fromBase58(
      this._xPub,
      this._network
    )
    return this._baseDerivationNode
  }

  async baseDerivationNode () {
    if (this._xPub) {
      return this._getBaseDerivationNode()
    }
    return super.baseDerivationNode()
  }
}
