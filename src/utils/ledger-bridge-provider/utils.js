import {
  BRIDGE_IFRAME_NAME,
  BRIDGE_REPLEY_PREFIX
} from './config'

export const setupBridgeIframe = (bridgeUrl) => {
  if (!document.getElementById(BRIDGE_IFRAME_NAME)) {
    const frame = document.createElement('iframe')
    frame.src = bridgeUrl
    frame.setAttribute('name', BRIDGE_IFRAME_NAME)
    frame.setAttribute('id', BRIDGE_IFRAME_NAME)
    const head = document.head || document.getElementsByTagName('head')[0]
    head.appendChild(frame)
  }
}

export function getReplySignature (app, method, callType) {
  return `${BRIDGE_REPLEY_PREFIX}::${app}::${method}::${callType}`
}

export const sendMessageToBridge = ({ method, callType, payload, app }) => {
  const frame = document.getElementById(BRIDGE_IFRAME_NAME)
  frame.contentWindow.postMessage({
    app,
    method,
    payload,
    callType
  }, '*')
}

export async function callToBridge ({ app, method, callType, payload }) {
  console.log('[EXTENSION-LEDGER-BRIDGE]:', { method, callType, payload })
  const replySignature = getReplySignature(app, method, callType)
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
              parseResponsePayload(payload)
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
          `Timeout calling the hw bridge: ${app}.${method}`
            ))
          }
        }, 60000)
        return true
      })

    const parsedPayload = parseRequestPayload(payload)
    sendMessageToBridge({ app, method, callType, payload: parsedPayload })
  })
}

export function parseResponsePayload (payload) {
  if (payload) {
    if (payload.type && payload.type === 'Hex') {
      return Buffer.from(payload.data || '', 'hex')
    }

    if (payload instanceof Array) {
      return payload.map(i => parseResponsePayload(i))
    }

    if (typeof payload === 'object' && Object.keys(payload).length > 0) {
      const output = {}
      for (const key in payload) {
        output[key] = parseResponsePayload(payload[key])
      }
      return output
    }
  }

  return payload
}

export function parseRequestPayload (payload) {
  if (payload instanceof Uint8Array || payload instanceof Buffer) {
    return { type: 'Hex', data: payload.toString('hex') }
  }

  if (payload instanceof Array) {
    return payload.map(i => parseRequestPayload(i))
  }

  if (payload && typeof payload === 'object') {
    if (Object.keys(payload).length > 0) {
      const output = {}
      for (const key in payload) {
        output[key] = parseRequestPayload(payload[key])
      }
      return output
    }
  }

  return payload
}
