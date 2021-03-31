import EthereumLedgerProvider from '@liquality/ethereum-ledger-provider'
import { EthereumLedgerBridgeApp } from './EthereumLedgerBridgeApp'
import { version } from '../../../package.json'
import networks from '@liquality/ethereum-networks'

export class EthereumLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp = null
  _bridgeUrl

  constructor (network = networks.mainnet, bridgeUrl) {
    super(network)
    this._bridgeUrl = bridgeUrl
  }

  async getApp () {
    return new Promise((resolve) => {
      if (!this._ledgerApp) {
        this._ledgerApp = new Proxy(new EthereumLedgerBridgeApp(), { get: this.errorProxy.bind(this) })
      }
      resolve(this._ledgerApp)
    })
  }
}

EthereumLedgerBridgeProvider.version = version
