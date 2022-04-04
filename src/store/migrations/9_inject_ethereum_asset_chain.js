import { assets as cryptoassets, ChainId } from '@liquality/cryptoassets'

export const injectEthereumAssetChain = {
  // Inject ethereum asset -> chain
  version: 9,
  migrate: async (state) => {
    const injectEthereumChain = cryptoassets[state.injectEthereumAsset]?.chain || ChainId.Ethereum
    delete state.injectEthereumAsset

    return { ...state, injectEthereumChain }
  }
}
