import { ChainId } from '@liquality/cryptoassets'

export const rskFishToken = {
  version: 13,
  migrate: async (state) => {
    const { activeWalletId, enabledAssets } = state
    const mainnetAccounts = state.accounts[activeWalletId].mainnet.map(account => {
      if (account.chain === ChainId.Rootstock) {
        return {
          ...account,
          assets: [...account.assets, 'FISH']
        }
      }
      return account
    })

    return {
      ...state,
      accounts: {
        ...state.accounts,
        [activeWalletId]: {
          ...state.accounts[activeWalletId],
          mainnet: mainnetAccounts
        }
      },
      enabledAssets: {
        ...enabledAssets,
        mainnet: {
          ...enabledAssets.mainnet,
          activeWalletId: [...enabledAssets.mainnet[activeWalletId], 'FISH']
        }
      }
    }
  }
}
