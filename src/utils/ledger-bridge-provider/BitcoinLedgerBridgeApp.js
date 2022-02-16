import { LedgerBridgeApp } from './LedgerBridgeApp'
import { ExecutionMode } from '@liquality/hw-web-bridge'

export class BitcoinLedgerBridgeApp extends LedgerBridgeApp {
  async signMessageNew(...payload) {
    return this.callToBridge({
      action: 'signMessageNew',
      execMode: ExecutionMode.Async,
      payload
    })
  }

  async getWalletPublicKey(...payload) {
    return this.callToBridge({
      action: 'getWalletPublicKey',
      execMode: ExecutionMode.Async,
      payload
    })
  }

  async splitTransaction(...payload) {
    return this.callToBridge({
      action: 'splitTransaction',
      execMode: ExecutionMode.Sync,
      payload
    })
  }

  async createPaymentTransactionNew(...payload) {
    return this.callToBridge({
      action: 'createPaymentTransactionNew',
      execMode: ExecutionMode.Async,
      payload
    })
  }

  async serializeTransactionOutputs(...payload) {
    return await this.callToBridge({
      action: 'serializeTransactionOutputs',
      execMode: ExecutionMode.Async,
      payload
    })
  }

  async signP2SHTransaction(...payload) {
    return await this.callToBridge({
      action: 'signP2SHTransaction',
      execMode: ExecutionMode.Async,
      payload
    })
  }
}
