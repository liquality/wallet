import { createClient } from './factory/client'
import buildConfig from '../build.config'

const clientCache = {}

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
  }
}
