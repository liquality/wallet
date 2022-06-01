import { createClient } from '@liquality/hw-web-bridge'
import store from '@/store'
import { BG_PREFIX } from '@/broker/utils'

let bridgeClient = null

export const createBridgeClient = () => {
  const { usbBridgeWindowsId } = store.state
  store.dispatch('app/closeExistingBridgeWindow', { windowsId: usbBridgeWindowsId })
  bridgeClient = createClient()
  bridgeClient
    .onConnect(() => {
      store.dispatch('app/setLedgerBridgeConnected', { connected: true })
    })
    .onDisconnect(() => {
      store.dispatch('app/setLedgerBridgeConnected', { connected: false })
      store.dispatch('app/setLedgerBridgeTransportConnected', { connected: false })
      const { usbBridgeWindowsId } = store.state
      store.dispatch('app/closeExistingBridgeWindow', { windowsId: usbBridgeWindowsId })
    })
    .onTransportConnect(() => {
      store.dispatch('app/setLedgerBridgeTransportConnected', { connected: true })
    })
    .onTransportDisconnected(() => {
      store.dispatch('app/setLedgerBridgeTransportConnected', { connected: false })
    })
  return bridgeClient
}

/**
 * @typedef ClientAppRequest
 * @type {object}
 * @property {string} namespace - Transport, App
 * @property {string} action
 * @property {string} execMode - Sync, Async, Prop
 * @property {*} payload
 * @property {string} network - mainnet, testnet
 * @property {ChainId} chainId - bitcoin, ethereum, from ChainId in cryptassets package
 */

/**
 * @param {ClientAppRequest} message
 * @returns Promise<any>
 */
export const callToBridge = async (message) => {
  return bridgeClient?.sendMessage(message)
}

export const createConnectSubscription = (onConnect) => {
  const unsubscribe = store.subscribe(async ({ type, payload }) => {
    if (type === `${BG_PREFIX}app/SET_LEDGER_BRIDGE_CONNECTED` && payload.connected === true) {
      onConnect()
      if (unsubscribe) {
        unsubscribe()
      }
    }
  })
  return unsubscribe
}
