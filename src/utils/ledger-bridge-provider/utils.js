import {
  createClient
} from '@liquality/hw-web-bridge'
import store from '@/store'
import { findCryptoCurrencyById } from '@ledgerhq/cryptoassets'

let bridgeClient = null

export const createBridgeClient = ({
  onTransportConnect,
  onConnect
} = {}) => {
  const { usbBridgeWindowsId } = store.state
  store.dispatch('app/closeExistingBridgeWindow', { windowsId: usbBridgeWindowsId })
  bridgeClient = createClient()
  bridgeClient.onConnect(() => {
    store.dispatch('app/setLedgerBridgeConnected', { connected: true })
    if (onConnect) {
      onConnect()
    }
  }).onDisconnect(() => {
    store.dispatch('app/setLedgerBridgeConnected', { connected: false })
    store.dispatch('app/setLedgerBridgeTransportConnected', { connected: false })
    const { usbBridgeWindowsId } = store.state
    store.dispatch('app/closeExistingBridgeWindow', { windowsId: usbBridgeWindowsId })
  }).onTransportConnect(
    () => {
      store.dispatch('app/setLedgerBridgeTransportConnected', { connected: true })
      if (onTransportConnect) {
        onTransportConnect()
      }
    }
  )
    .onTransportDisconnected(() => {
      store.dispatch('app/setLedgerBridgeTransportConnected', { connected: false })
      const { usbBridgeWindowsId } = store.state
      store.dispatch('app/closeExistingBridgeWindow', { windowsId: usbBridgeWindowsId })
      bridgeClient = null
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
  return bridgeClient.sendMessage(message)
}

export const getXPubVersion = (network) => {
  const id = network === 'mainnet' ? 'bitcoin' : 'bitcoin_testnet'
  const { bitcoinLikeInfo: { XPUBVersion } } = findCryptoCurrencyById(id)
  return XPUBVersion
}
