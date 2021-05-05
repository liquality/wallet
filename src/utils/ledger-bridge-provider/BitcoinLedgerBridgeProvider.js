import { BitcoinLedgerProvider } from '@liquality/bitcoin-ledger-provider'

export class BitcoinLedgerBridgeProvider extends BitcoinLedgerProvider {
  _ledgerApp

  constructor ({
    network,
    Transport,
    baseDerivationPath,
    addressType
  },
  ledgerApp) {
    super({
      network,
      Transport,
      baseDerivationPath,
      addressType
    })
    this._ledgerApp = new Proxy(ledgerApp, { get: this.errorProxy.bind(this) })
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }
}
