import buildConfig from '../../build.config'

// Set the default assets
export const setDefaultAssets = {
  version: 2,
  migrate: async (state) => {
    const enabledAssets = {
      mainnet: {
        [state.activeWalletId]: buildConfig.defaultAssets.mainnet
      },
      testnet: {
        [state.activeWalletId]: buildConfig.defaultAssets.testnet
      }
    }
    return { ...state, enabledAssets }
  }
}
