
import {
  BRIDGE_IFRAME_ID,
  BRIDGE_REPLEY_PREFIX,
  BRIDGE_IFRAME_NAME
} from '../../utils/hw-bridge'

export class LedgerBridgeApp {
  _app

  constructor (app) {
    this._app = app
    this.setupIframe()
  }

  setupIframe () {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://localhost:9000'

    iframe.setAttribute('id', BRIDGE_IFRAME_ID)
    iframe.setAttribute('name', BRIDGE_IFRAME_NAME)
    iframe.setAttribute('style', 'height: 0%; width: 0%; border: 0; margin: 0;')
    document.body.appendChild(iframe)
  }

  sendMessageToHWBridge ({ app, method, callType, payload }) {
    const iframe = document.getElementById(BRIDGE_IFRAME_ID)

    if (iframe) {
      iframe.contentWindow.postMessage({
        app,
        method,
        payload,
        callType
      }, '*')
      console.log('message send to the bridge: ', app, method, payload, callType)
    } else {
      console.log('message not send: ', app, method, payload)
    }
  }

  sendMessage ({ method, callType, payload }) {
    this.sendMessageToHWBridge({ app: this._app, method, payload, callType })
  }

  getReplySignature (method, callType) {
    return `${BRIDGE_REPLEY_PREFIX}::${this._app}::${method}::${callType}`
  }

  async callBridge ({ method, callType, payload }) {
    const replySignature = this.getReplySignature(method, callType)
    return new Promise((resolve, reject) => {
      chrome.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {
          console.log('chrome.runtime.onMessage', request)
          sendResponse({ message: 'hi to you' })
        })

      chrome.runtime.onMessageExternal.addListener(
        (request, sender, sendResponse) => {
          console.log('chrome.runtime.onMessageExternal', request)
          sendResponse({ message: 'hi to you' })
        })

      chrome.runtime.onMessageExternal.addListener(
        ({
          action,
          success,
          payload
        }, sender, sendResponse) => {
          console.log('chrome.runtime.onMessage.addListener', payload)
          if (replySignature === action) {
            if (success) {
              resolve(payload)
            } else {
              reject(payload)
            }
          }

          sendResponse(payload)
          return true
        }
      )

      this.sendMessage({ method, callType, payload })
      setTimeout(() => {
        reject(new Error(
          `Timeout calling the hw bridge: ${this._app}.${method}`
        ))
      }, 300000)
    })
  }
}
