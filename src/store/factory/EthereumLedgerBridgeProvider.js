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

  async isWalletAvailable () {
    // const app = await this.getApp()
    // if (!app.transport.scrambleKey) { // scramble key required before calls
    //   app.transport.setScrambleKey(this._ledgerScrambleKey)
    // }
    // const exchangeTimeout = app.transport.exchangeTimeout
    // app.transport.setExchangeTimeout(2000)
    // try {
    //   // https://ledgerhq.github.io/btchip-doc/bitcoin-technical-beta.html#_get_random
    //   await this._transport.send(0xe0, 0xc0, 0x00, 0x00)
    // } catch (e) {
    //   return false
    // } finally {
    //   app.transport.setExchangeTimeout(exchangeTimeout)
    // }
    return true
  }
}

EthereumLedgerBridgeProvider.version = version
