import cryptoassets from '@liquality/cryptoassets'
import { createClient } from './factory/client'
import buildConfig from '../build.config'

const clientCache = {}

const TESTNET_CONTRACT_ADDRESSES = {
  DAI: '0xcE2748BE67fB4346654B4500c4BB0642536365FC'
}
const TESTNET_ASSETS = ['BTC', 'ETH', 'RBTC', 'DAI'].reduce((assets, asset) => {
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
    return (network, walletId, asset, clientType) => {
      const cacheKey = [asset, network, walletId, clientType].join('-')

      const cachedClient = clientCache[cacheKey]
      if (cachedClient) return cachedClient

      const { mnemonic } = state.wallets.find(w => w.id === walletId)
      const client = createClient(asset, network, mnemonic, clientType)
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
  },
  networkAssets (state) {
    const { enabledAssets, activeNetwork, activeWalletId } = state
    return enabledAssets[activeNetwork][activeWalletId]
  },
  orderedBalances (state, getters) {
    const { enabledAssets, activeNetwork, activeWalletId } = state
    const { networkWalletBalances } = getters
    if (!networkWalletBalances) {
      return []
    }
    const assets = enabledAssets[activeNetwork][activeWalletId]
    return Object.entries(networkWalletBalances)
      .filter(([asset]) => assets.includes(asset))
      .sort(([assetA], [assetB]) => {
        return assets.indexOf(assetA) - assets.indexOf(assetB)
      })
  },
  networkWalletBalances (state) {
    const { balances, activeNetwork, activeWalletId } = state
    return balances[activeNetwork]?.[activeWalletId]
  },
  assetsWithBalance (_state, getters) {
    const { orderedBalances } = getters
    return orderedBalances.filter(([asset, balance]) => balance > 0)
  },
  networkAssetsLoaded (_state, getters) {
    const { networkAssets, networkWalletBalances } = getters
    return networkWalletBalances && Object.keys(networkWalletBalances).length >= networkAssets.length
  },
  activity (state) {
    const { history, activeNetwork, activeWalletId } = state
    if (!history[activeNetwork]) return []
    if (!history[activeNetwork][activeWalletId]) return []
    return history[activeNetwork][activeWalletId].slice().reverse()
  }
}
