
import {
  BRIDGE_REPLEY_PREFIX,
  BRIDGE_IFRAME_NAME
} from './config'
import { setupBridgeIframe } from './utils'

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

  sendMessage ({ method, callType, payload }) {
    const frame = document.getElementById(BRIDGE_IFRAME_NAME)
    frame.contentWindow.postMessage({
      app: this._app,
      method,
      payload,
      callType
    }, '*')
  }

  getReplySignature (method, callType) {
    return `${BRIDGE_REPLEY_PREFIX}::${this._app}::${method}::${callType}`
  }

  async callToBridge ({ method, callType, payload }) {
    console.log('[EXTENSION-LEDGER-BRIDGE]:', { method, callType, payload })
    const replySignature = this.getReplySignature(method, callType)
    let responded = false
    return new Promise((resolve, reject) => {
      chrome.runtime.onMessageExternal.addListener(
        async (request, sender, sendResponse) => {
          if (!request) {
            return
          }

          const {
            action,
            success,
            payload
          } = request
          if (replySignature === action) {
            console.log('[EXTENSION-LEDGER-BRIDGE]: GOT MESAGE FROM IFRAME', request)
            responded = true
            sendResponse({ success })
            if (success) {
              resolve(
                this.parseResponsePayload(payload)
              )
            } else {
              const error = new Error(
                payload.message
              )
              error.stack = payload.stask
              error.name = payload.name
              reject(error)
            }
          }

          setTimeout(() => {
            if (!responded) {
              sendResponse({ success: false })
              reject(new Error(
            `Timeout calling the hw bridge: ${this._app}.${method}`
              ))
            }
          }, 60000)
          return true
        })

      const parsedPayload = this.parseRequestPayload(payload)
      this.sendMessage({ method, callType, payload: parsedPayload })
    })
  }

  parseResponsePayload (payload) {
    if (payload) {
      if (payload.type && payload.type === 'Hex') {
        return Buffer.from(payload.data || '', 'hex')
      }

      if (payload instanceof Array) {
        return payload.map(i => this.parseResponsePayload(i))
      }

      if (typeof payload === 'object' && Object.keys(payload).length > 0) {
        const output = {}
        for (const key in payload) {
          output[key] = this.parseResponsePayload(payload[key])
        }
        return output
      }
    }

    return payload
  }

  parseRequestPayload (payload) {
    if (payload instanceof Uint8Array || payload instanceof Buffer) {
      return { type: 'Hex', data: payload.toString('hex') }
    }

    if (payload instanceof Array) {
      return payload.map(i => this.parseRequestPayload(i))
    }

    if (payload && typeof payload === 'object') {
      if (Object.keys(payload).length > 0) {
        const output = {}
        for (const key in payload) {
          output[key] = this.parseRequestPayload(payload[key])
        }
        return output
      }
    }

    return payload
  }
}
