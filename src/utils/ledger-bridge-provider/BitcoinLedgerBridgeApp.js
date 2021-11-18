import { LedgerBridgeApp } from './LedgerBridgeApp'
import {
  ExecutionMode
} from '@liquality/hw-web-bridge'

export class BitcoinLedgerBridgeApp extends LedgerBridgeApp {
  async signMessageNew (...payload) {
    return await this.callToBridge({
      action: 'signMessageNew',
      execMode: ExecutionMode.Async,
      payload
    })
  }

  async getWalletPublicKey (...payload) {
    return await this.callToBridge({
      action: 'getWalletPublicKey',
      execMode: ExecutionMode.Async,
      payload
    })
  }

  async splitTransaction (...payload) {
    return await this.callToBridge({
      action: 'splitTransaction',
      execMode: ExecutionMode.Sync,
      payload
    })
  }

  async createPaymentTransactionNew (...payload) {
    return await this.callToBridge({
      action: 'createPaymentTransactionNew',
      execMode: ExecutionMode.Async,
      payload
    })
  }

  async serializeTransactionOutputs (...payload) {
    return await this.callToBridge({
      action: 'serializeTransactionOutputs',
      execMode: ExecutionMode.Sync,
      payload
    })
  }
}
