import {
  createClient
} from '@liquality/hw-web-bridge'

let bridgeClient = null

export const setLedgerBridgeListener = (connected) => {
  if (!connected || !bridgeClient) {
    bridgeClient = createClient()
  }

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
    throw new Error('Ledger Bridge client is not initialized')
  }
  return bridgeClient.sendMessage(message)
}
