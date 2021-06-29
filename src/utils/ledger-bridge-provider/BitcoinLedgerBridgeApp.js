import { LedgerBridgeApp } from './LedgerBridgeApp'

export class BitcoinLedgerBridgeApp extends LedgerBridgeApp {
  constructor (network) {
    super(network, 'BTC')
  }

  async signMessageNew (...payload) {
    return await this.callToBridge({
      method: 'signMessageNew',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async getWalletPublicKey (...payload) {
    return await this.callToBridge({
      method: 'getWalletPublicKey',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async splitTransaction (...payload) {
    return await this.callToBridge({
      method: 'splitTransaction',
      callType: 'METHOD',
      payload
    })
  }

  async createPaymentTransactionNew (...payload) {
    return await this.callToBridge({
      method: 'createPaymentTransactionNew',
      callType: 'ASYNC_METHOD',
      payload
    })
  }

  async serializeTransactionOutputs (...payload) {
    return await this.callToBridge({
      method: 'serializeTransactionOutputs',
      callType: 'METHOD',
      payload
    })
  }
}
