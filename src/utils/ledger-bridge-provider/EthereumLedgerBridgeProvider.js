import { EthereumLedgerProvider } from '@liquality/ethereum-ledger-provider'

export class EthereumLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp

  constructor ({ network, derivationPath, Transport }, ledgerApp) {
    super({ network, derivationPath, Transport })
    this._ledgerApp = new Proxy(ledgerApp, { get: this.errorProxy.bind(this) })
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }
}
