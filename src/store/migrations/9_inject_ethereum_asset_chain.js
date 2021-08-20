import { assets as cryptoassets } from '@liquality/cryptoassets'

export const injectEthereumAssetChain = { // Inject ethereum asset -> chain
  version: 9,
  migrate: async (state) => {
    const injectEthereumChain = cryptoassets[state.injectEthereumAsset]?.chain || 'ethereum'
    delete state.injectEthereumAsset

    return { ...state, injectEthereumChain }
  }
}
