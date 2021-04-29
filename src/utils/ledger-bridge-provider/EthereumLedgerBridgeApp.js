import { LedgerBridgeApp } from './LedgerBridgeApp'

export class EthereumLedgerBridgeApp extends LedgerBridgeApp {
  constructor (bridgeUrl) {
    super('ETH', bridgeUrl)
  }

  async getAddress (...payload) {
    return await this.callToBridge({
      method: 'getAddress',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async signPersonalMessage (...payload) {
    return await this.callToBridge({
      method: 'signPersonalMessage',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async signTransaction (...payload) {
    return await this.callToBridge({
      method: 'signTransaction',
      callType: 'ASYNC_METHOD',
      payload
    })
  }
}
