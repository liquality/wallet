
import {
  BRIDGE_REPLEY_PREFIX,
  BRIDGE_IFRAME_NAME
} from './config'

export class LedgerBridgeApp {
  _app

  constructor (app) {
    this._app = app
    LedgerBridgeApp.setupIframe()
  }

  static setupIframe () {
    if (!document.getElementById(BRIDGE_IFRAME_NAME)) {
      const frame = document.createElement('iframe')
      frame.src = 'https://localhost:9000'
      frame.setAttribute('name', BRIDGE_IFRAME_NAME)
      frame.setAttribute('id', BRIDGE_IFRAME_NAME)
      const head = document.head || document.getElementsByTagName('head')[0]
      head.appendChild(frame)
    }
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
    console.log('[LEDGER-BRIDGE]:', { method, callType, payload })
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
            console.log('[LEDGER-BRIDGE]: GOT MESAGE FROM IFRAME', request)
            responded = true
            sendResponse({ success })
            if (success) {
              resolve(payload)
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
      this.sendMessage({ method, callType, payload })
    })
  }
}
