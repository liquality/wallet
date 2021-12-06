import {
  createClient
} from '@liquality/hw-web-bridge'
import store from '@/store'
import { findCryptoCurrencyById } from '@ledgerhq/cryptoassets'

let bridgeClient = null
const onTransportConnect = () => {
  store.dispatch('app/setLedgerBridgeTransportConnected', { connected: true })
}

export const createBridgeClient = () => {
  bridgeClient = createClient()
  bridgeClient.onConnect(() => {
    store.dispatch('app/setLedgerBridgeConnected', { connected: true })
  }).onDisconnect(() => {
    store.dispatch('app/setLedgerBridgeConnected', { connected: false })
    store.dispatch('app/setLedgerBridgeTransportConnected', { connected: false })
    const { usbBridgeWindowsId } = store.state
    store.dispatch('app/closeExistingBridgeWindow', { windowsId: usbBridgeWindowsId })
  }).onTransportConnect(onTransportConnect)
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
  if (!bridgeClient) {
    createBridgeClient()
  }

  const { ledgerBridgeConnected, ledgerBridgeTransportConnected } = store.state.app
  if (ledgerBridgeConnected && ledgerBridgeTransportConnected) {
    return bridgeClient.sendMessage(message)
  }

  await store.dispatch('app/openLedgerBridgeWindow')
  return new Promise((resolve) => {
    bridgeClient.onTransportConnect(async () => {
      await store.dispatch('app/setLedgerBridgeTransportConnected', { connected: true })
      resolve(await bridgeClient.sendMessage(message))
    })
  })
}

export const getXPubVersion = (network) => {
  const id = network === 'mainnet' ? 'bitcoin' : 'bitcoin_testnet'
  const { bitcoinLikeInfo: { XPUBVersion } } = findCryptoCurrencyById(id)
  return XPUBVersion
}
