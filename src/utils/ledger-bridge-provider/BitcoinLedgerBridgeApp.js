import { LedgerBridgeApp } from './LedgerBridgeApp'

export class BitcoinLedgerBridgeApp extends LedgerBridgeApp {
  constructor (bridgeUrl) {
    super('BTC', bridgeUrl)
  }

  async signMessageNew (...payload) {
    return await super.callToBridge({
      method: 'signMessageNew',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async getWalletPublicKey (...payload) {
    return await super.callToBridge({
      method: 'getWalletPublicKey',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async splitTransaction (...payload) {
    return await super.callToBridge({
      method: 'splitTransaction',
      callType: 'METHOD',
      payload
    })
  }

  async createPaymentTransactionNew (...payload) {
    return await super.callToBridge({
      method: 'createPaymentTransactionNew',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async serializeTransactionOutputs (...payload) {
    return await super.callToBridge({
      method: 'serializeTransactionOutputs',
      callType: 'METHOD',
      payload
    })
  }
}
