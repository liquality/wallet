export const fixRSKTokenInjectedAsset = { // Fix for RSK token injected asset
  version: 4,
  migrate: async (state) => {
    if (state.injectEthereumAsset === 'RSK') {
      const injectEthereumAsset = 'RBTC'
      return { ...state, injectEthereumAsset }
    }

    return { ...state }
  }
}
