import {
  BRIDGE_REPLEY_PREFIX
} from './config'
import EventEmitter from 'events'

let CHROME_PORT = null
const bridgeEmiter = new EventEmitter()

export const setLedgerBridgeListener = () => {
  if (!CHROME_PORT) {
    chrome.runtime.onConnectExternal.addListener(port => {
      port.onDisconnect.addListener(() => {
        CHROME_PORT = null
        return true
      })
      CHROME_PORT = port
      port.onMessage.addListener(
        async (request) => {
          if (!request) {
            return
          }

          const {
            action
          } = request
          console.log('action', action)
          bridgeEmiter.emit(action, request)
        })
    })
  }
  return bridgeEmiter
}

export const sendMessageToBridge = ({ network, app, method, callType, payload }) => {
  CHROME_PORT.postMessage({
    network,
    app,
    method,
    payload,
    callType
  })
}

export function getReplySignature (network, app, method, callType) {
  return `${BRIDGE_REPLEY_PREFIX}::${network}::${app}::${method}::${callType}`
}

export async function callToBridge ({ network, app, method, callType, payload }) {
  console.log('[EXTENSION-LEDGER-BRIDGE]:', { network, method, callType, payload })
  const replySignature = getReplySignature(network, app, method, callType)
  let responded = false
  return new Promise((resolve, reject) => {
    const listener = async (request) => {
      const {
        action,
        success,
        payload
      } = request
      if (replySignature === action) {
        console.log('[EXTENSION-LEDGER-BRIDGE]: GOT MESAGE FROM IFRAME', request)
        responded = true
        if (success) {
          bridgeEmiter.removeListener(replySignature, listener)
          resolve(
            parseResponsePayload(payload)
          )
        } else {
          const error = new Error(
            payload.message
          )
          error.stack = payload.stask
          error.name = payload.name
          bridgeEmiter.removeListener(replySignature, listener)
          reject(error)
        }
      }
    }

    bridgeEmiter.once(replySignature, listener)
    setTimeout(() => {
      if (!responded) {
        bridgeEmiter.removeListener(replySignature, listener)
        reject(new Error(
      `Timeout calling the hw bridge: ${app}.${method}`
        ))
      }
    }, 60000)

    const parsedPayload = parseRequestPayload(payload)
    sendMessageToBridge({ network, app, method, callType, payload: parsedPayload })
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
