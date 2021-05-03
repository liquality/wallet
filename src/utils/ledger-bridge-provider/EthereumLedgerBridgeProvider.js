import EthereumLedgerProvider from '@liquality/ethereum-ledger-provider'
import { version } from '../../../package.json'
import { EthereumNetworks } from '@liquality/ethereum-networks'

export class EthereumLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp

  constructor (network = EthereumNetworks.ethereum_mainnet, ledgerApp) {
    super(network)
    this._ledgerApp = new Proxy(ledgerApp, { get: this.errorProxy.bind(this) })
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }
}

EthereumLedgerBridgeProvider.version = version
