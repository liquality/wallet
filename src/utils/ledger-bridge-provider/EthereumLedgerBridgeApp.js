import { LedgerBridgeApp } from './LedgerBridgeApp'
import {
  ExecutionMode
} from '@liquality/hw-web-bridge'

export class EthereumLedgerBridgeApp extends LedgerBridgeApp {
  async getAddress (...payload) {
    return await this.callToBridge({
      action: 'getAddress',
      execMode: ExecutionMode.Async,
      payload
    })
  }

  async signPersonalMessage (...payload) {
    return await this.callToBridge({
      action: 'signPersonalMessage',
      execMode: ExecutionMode.Async,
      payload
    })
  }

  async signTransaction (...payload) {
    return await this.callToBridge({
      action: 'signTransaction',
      execMode: ExecutionMode.Async,
      payload
    })
  }
}
