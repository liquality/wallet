import { callToBridge } from './utils'

export class LedgerBridgeApp {
  _network
  _app

  constructor (network, app) {
    this._network = network
    this._app = app
  }

  async callToBridge ({ method, callType, payload }) {
    return callToBridge({
      network: this._network,
      app: this._app,
      method,
      callType,
      payload
    })
  }
}
