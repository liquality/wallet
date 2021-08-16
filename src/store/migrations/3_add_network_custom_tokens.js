// Add network to custom tokens
export const addNetworkCustomTokens = {
  version: 3,
  migrate: async (state) => {
    const customTokens = {
      mainnet: {
        [state.activeWalletId]: state.customTokens?.mainnet?.[
          state.activeWalletId
        ].map((token) => ({ ...token, network: 'ethereum' }))
      },
      testnet: {
        [state.activeWalletId]: state.customTokens?.testnet?.[
          state.activeWalletId
        ].map((token) => ({ ...token, network: 'ethereum' }))
      }
    }
    return { ...state, customTokens }
  }
}
