import { LedgerBridgeApp } from './LedgerBridgeApp'

export class EthereumLedgerBridgeApp extends LedgerBridgeApp {
  constructor () {
    super('ETH')
  }

  async getAddress (path) {
    return await super.callBridge({
      method: 'getAddress',
      callType: 'ASYNC_METHOD',
      payload: [path]
    })
  }

  async signPersonalMessage (path, message) {
    return await super.callBridge({
      method: 'signPersonalMessage',
      callType: 'ASYNC_METHOD',
      payload: [path, message]
    })
  }

  async signTransaction (path, serializedTx) {
    return await super.callBridge({
      method: 'signTransaction',
      callType: 'ASYNC_METHOD',
      payload: [path, serializedTx]
    })
  }
}
