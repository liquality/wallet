import { Networks } from '@/utils/networks'
import buildConfig from '@/build.config'

export const accountsChainsSetEnabled = {
  version: 15,
  migrate: async (state) => {
    const accounts = {}
    const enabledChains = {}

    for (const walletId in state.accounts) {
      accounts[walletId] = {}
      enabledChains[walletId] = {}

      for (const network of Networks) {
        const updatedAccounts = state.accounts[walletId][network].map(a => ({ ...a, enabled: true }))
        accounts[walletId][network] = updatedAccounts
        enabledChains[walletId][network] = [...buildConfig.chains]
      }
    }

    return {
      ...state,
      enabledChains,
      accounts
    }
  }
}
