import EthereumLedgerProvider from '@liquality/ethereum-ledger-provider'
import { EthereumLedgerBridgeApp } from './EthereumLedgerBridgeApp'
import { version } from '../../../package.json'

export class EthereumLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp = null

  async getApp () {
    return new Promise((resolve) => {
      if (!this._ledgerApp) {
        this._ledgerApp = new EthereumLedgerBridgeApp()
      }
      resolve(this._ledgerApp)
    })
  }
}

EthereumLedgerBridgeProvider.version = version
