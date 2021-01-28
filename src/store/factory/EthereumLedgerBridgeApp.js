import { LedgerBridgeApp } from './LedgerBridgeApp'

export class EthereumLedgerBridgeApp extends LedgerBridgeApp {
  constructor () {
    super('ETH')
  }

  async getAddress (path) {
    return await super.callAppMethod('getAddress', path)
  }

  async signPersonalMessage (path, message) {
    return await super.callAppMethod(
      'signPersonalMessage',
      path,
      message
    )
  }

  async signTransaction (path, serializedTx) {
    return await super.callAppMethod(
      'signTransaction',
      path,
      serializedTx
    )
  }
}
