import { LedgerBridgeApp } from './LedgerBridgeApp'

export class BitcoinLedgerBridgeApp extends LedgerBridgeApp {
  constructor () {
    super('BTC')
  }

  async signMessageNew (path, hex) {
    return await super.callToBridge({
      method: 'signMessageNew',
      callType: 'ASYNC_METHOD',
      payload: [path, hex]
    })
  }

  async getWalletPublicKey (path) {
    return await super.callToBridge({
      method: 'getWalletPublicKey',
      callType: 'ASYNC_METHOD',
      payload: [path]
    })
  }
}
