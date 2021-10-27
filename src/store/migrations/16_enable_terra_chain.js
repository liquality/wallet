import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import { Networks } from '@/utils/networks'
import { getDerivationPath } from '@/utils/derivationPath'
import { chains, ChainId } from '@liquality/cryptoassets'

export const enableTerraChain = {
  version: 16,
  migrate: async (state) => {
    const accounts = {}
    const enabledChains = {}
    for (const walletId in state.accounts) {
      accounts[walletId] = {}
      enabledChains[walletId] = {}

      for (const network of Networks) {
        const accountExists = state.accounts[walletId][network].find(account => account.chain === ChainId.Terra)
        if (accountExists) {
          accounts[walletId][network] = [...state.accounts[walletId][network]]
        } else {
          const chain = chains[ChainId.Terra]
          const derivationPath = getDerivationPath(ChainId.Terra, network, 0, 'default')
          const terraAccount = accountCreator({
            walletId,
            network,
            account: {
              name: `${chain.name} 1`,
              alias: '',
              chain: ChainId.Terra,
              addresses: [],
              assets: ['LUNA', 'UST'],
              balances: {},
              type: 'default',
              index: 0,
              derivationPath,
              color: getNextAccountColor(ChainId.Terra, 0)
            }
          })
          accounts[walletId][network] = [...state.accounts[walletId][network], terraAccount]
        }

        const chainEnabled = state.enabledChains[walletId][network].includes(ChainId.Terra)
        if (chainEnabled) {
          enabledChains[walletId][network] = [...state.enabledChains[walletId][network]]
        } else {
          enabledChains[walletId][network] = [...state.enabledChains[walletId][network], ChainId.Terra]
        }
      }
    }

    const enabledAssets = {}
    for (const network of Networks) {
      enabledAssets[network] = {}
      for (const walletId in state.enabledAssets[network]) {
        enabledAssets[network][walletId] = [...state.enabledAssets[network][walletId]]
        if (!enabledAssets[network][walletId].includes('LUNA')) enabledAssets[network][walletId].push('LUNA')
        if (!enabledAssets[network][walletId].includes('UST')) enabledAssets[network][walletId].push('UST')
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
