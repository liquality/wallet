import { callToBridge, setupBridgeIframe } from './utils'

export class LedgerBridgeApp {
  _network
  _app
  _bridgeUrl

  constructor (network, app, bridgeUrl) {
    this._network = network
    this._app = app
    this._bridgeUrl = bridgeUrl
    this.setupIframe()
  }

  setupIframe () {
    setupBridgeIframe(this._bridgeUrl)
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
