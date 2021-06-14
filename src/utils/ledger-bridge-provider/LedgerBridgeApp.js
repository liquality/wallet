import { callToBridge, setupBridgeIframe } from './utils'

export class LedgerBridgeApp {
  _app
  _bridgeUrl

  constructor (app, bridgeUrl) {
    this._app = app
    this._bridgeUrl = bridgeUrl
    this.setupIframe()
  }

  setupIframe () {
    setupBridgeIframe(this._bridgeUrl)
  }

  async callToBridge ({ method, callType, payload }) {
    return callToBridge({ app: this._app, method, callType, payload })
  }
}
