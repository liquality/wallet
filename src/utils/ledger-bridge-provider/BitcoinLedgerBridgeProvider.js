import EthereumLedgerProvider from '@liquality/bitcoin-ledger-provider'
import { BitcoinLedgerBridgeApp } from './BitcoinLedgerBridgeApp'
import { version } from '../../../package.json'

export class BitcoinLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp = null

  async getApp () {
    return new Promise((resolve) => {
      if (!this._ledgerApp) {
        this._ledgerApp = new BitcoinLedgerBridgeApp()
      }
      resolve(this._ledgerApp)
    })
  }
}

BitcoinLedgerBridgeProvider.version = version
