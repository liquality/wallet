import cryptoassets from '@liquality/cryptoassets'
import { createClient } from './factory/client'
import buildConfig from '../build.config'

const clientCache = {}

const TESTNET_ASSETS = ['BTC', 'ETH', 'DAI']
const TESTNET_CONTRACT_ADDRESSES = {
  DAI: '0xcE2748BE67fB4346654B4500c4BB0642536365FC'
}

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
    let assets

    // Setup base assets straight from `cryptoassets` lib
    if (state.activeNetwork === 'testnet') {
      assets = TESTNET_ASSETS.reduce((assets, asset) => {
        return Object.assign(assets, {
          [asset]: {
            ...cryptoassets[asset],
            contractAddress: TESTNET_CONTRACT_ADDRESSES[asset]
          }
        })
      }, {})
    } else {
      assets = cryptoassets
    }

    return assets
  }
}
