import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import { Networks } from '@/utils/networks'
import { getDerivationPath } from '@/utils/derivationPath'
import { chains, ChainId } from '@liquality/cryptoassets'

export const enableAvalancheChain = {
  version: 18,
  migrate: async (state) => {
    const accounts = {}
    const enabledChains = {}
    for (const walletId in state.accounts) {
      accounts[walletId] = {}
      enabledChains[walletId] = {}

      for (const network of Networks) {
        const accountExistsAndProperlyInitialized = state.accounts[walletId][network].find(
          (account) => account.chain === ChainId.Avalanche && account.assets?.length > 0
        )
        if (accountExistsAndProperlyInitialized) {
          accounts[walletId][network] = [...state.accounts[walletId][network]]
        } else {
          const chain = chains[ChainId.Avalanche]
          const derivationPath = getDerivationPath(ChainId.Avalanche, network, 0, 'default')
          const avalancheAccount = accountCreator({
            walletId,
            network,
            account: {
              name: `${chain.name} 1`,
              alias: '',
              chain: ChainId.Avalanche,
              addresses: [],
              assets: ['AVAX'],
              balances: {},
              type: 'default',
              index: 0,
              derivationPath,
              color: getNextAccountColor(ChainId.Avalanche, 0)
            }
          })
          accounts[walletId][network] = [...state.accounts[walletId][network], avalancheAccount]
        }

        const chainEnabled = state.enabledChains[walletId][network].includes(ChainId.Avalanche)
        if (chainEnabled) {
          enabledChains[walletId][network] = [...state.enabledChains[walletId][network]]
        } else {
          enabledChains[walletId][network] = [
            ...state.enabledChains[walletId][network],
            ChainId.Avalanche
          ]
        }
      }
    }

    const enabledAssets = {}
    for (const network of Networks) {
      enabledAssets[network] = {}
      for (const walletId in state.enabledAssets[network]) {
        enabledAssets[network][walletId] = [...state.enabledAssets[network][walletId]]
        if (!enabledAssets[network][walletId].includes('AVAX'))
          enabledAssets[network][walletId].push('AVAX')
      }
    }

    return {
      ...state,
      enabledChains,
      enabledAssets,
      accounts
    }
  }
}
