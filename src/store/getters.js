import cryptoassets from '@liquality/cryptoassets'
import { createClient } from './factory/client'
import buildConfig from '../build.config'

const clientCache = {}

const TESTNET_CONTRACT_ADDRESSES = {
  DAI: '0xcE2748BE67fB4346654B4500c4BB0642536365FC'
}
const TESTNET_ASSETS = ['BTC', 'ETH', 'DAI'].reduce((assets, asset) => {
  return Object.assign(assets, {
    [asset]: {
      ...cryptoassets[asset],
      contractAddress: TESTNET_CONTRACT_ADDRESSES[asset]
    }
  })
}, {})

export default {
  agentEndpoints (state) {
    return network => buildConfig.agentEndpoints[network]
  },
  client (state) {
    return (network, walletId, asset) => {
      const cacheKey = [asset, network, walletId].join('-')

      const cachedClient = clientCache[cacheKey]
      if (cachedClient) return cachedClient

      const { mnemonic } = state.wallets.find(w => w.id === walletId)
      const client = createClient(asset, network, mnemonic)
      clientCache[cacheKey] = client

      return client
    }
  },
  historyItemById (state) {
    return (network, walletId, id) => state.history[network][walletId].find(i => i.id === id)
  },
  cryptoassets (state) {
    const { activeNetwork, activeWalletId } = state

    const baseAssets = state.activeNetwork === 'testnet' ? TESTNET_ASSETS : cryptoassets

    const customAssets = state.customTokens[activeNetwork]?.[activeWalletId]?.reduce((assets, token) => {
      return Object.assign(assets, {
        [token.symbol]: {
          ...baseAssets.DAI, // Use DAI as template for custom tokens
          ...token,
          code: token.symbol
        }
      })
    }, {})

    return Object.assign({}, baseAssets, customAssets)
  }
}
