import { createClient } from './factory/client'

const agentEndpoints = {
  testnet: [
    'https://liquality.io/swap-testnet/agent'
  ],
  mainnet: [
    'https://liquality.io/swap/agent'
  ]
}

const clientCache = {}

export default {
  agentEndpoints (state) {
    return network => agentEndpoints[network]
  },
  client (state) {
    return (network, walletId, asset) => {
      const cacheKey = [network, walletId].join('-')

      const cachedClient = clientCache[cacheKey]
      if (cachedClient) return cachedClient[asset]

      const { mnemonic } = state.wallets.find(w => w.id === walletId)
      const client = createClient(network, mnemonic)
      clientCache[cacheKey] = client

      return client[asset]
    }
  },
  historyItemById (state) {
    return (network, walletId, id) => state.history[network][walletId].find(i => i.id === id)
  }
}
