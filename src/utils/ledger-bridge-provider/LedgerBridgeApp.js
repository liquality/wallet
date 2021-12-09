import { callToBridge } from './utils'
import {
  RequestNamespace
} from '@liquality/hw-web-bridge'

export class LedgerBridgeApp {
  _network
  _chainId

  constructor (network, chainId) {
    this._network = network
    this._chainId = chainId
  }

  async callToBridge ({ action, execMode, payload }) {
    return callToBridge({
      namespace: RequestNamespace.App,
      network: this._network,
      chainId: this._chainId,
      action,
      execMode,
      payload
    })
  }
}
