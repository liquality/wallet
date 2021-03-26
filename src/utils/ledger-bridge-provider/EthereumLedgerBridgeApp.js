import { LedgerBridgeApp } from './LedgerBridgeApp'

export class EthereumLedgerBridgeApp extends LedgerBridgeApp {
  constructor (bridgeUrl) {
    super('ETH', bridgeUrl)
  }

  async getAddress (...payload) {
    return await super.callToBridge({
      method: 'getAddress',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async signPersonalMessage (...payload) {
    return await super.callToBridge({
      method: 'signPersonalMessage',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async signTransaction (...payload) {
    return await super.callToBridge({
      method: 'signTransaction',
      callType: 'ASYNC_METHOD',
      payload
    })
  }
}
