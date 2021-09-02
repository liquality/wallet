export const multiProviderSwaps = { // Multi provider swaps
  version: 7,
  migrate: async (state) => {
    const walletId = state.activeWalletId

    const migrateHistory = (state, network, walletId) => {
      const walletHistory = state.history[network]?.[walletId]
      return walletHistory && walletHistory.length
        ? walletHistory.map(item => item.type === 'SWAP' ? { ...item, provider: 'liquality' } : item)
        : []
    }

    const history = {
      mainnet: {
        [walletId]: migrateHistory(state, 'mainnet', walletId)
      },
      testnet: {
        [walletId]: migrateHistory(state, 'testnet', walletId)
      }
    }

    return { ...state, history }
  }
}
