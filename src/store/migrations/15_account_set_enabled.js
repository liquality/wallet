import { Networks } from '@/utils/networks'

export const accountSetEnabled = {
  version: 15,
  migrate: async (state) => {
    const accounts = {}

    for (const walletId in state.accounts) {
      accounts[walletId] = {}

      for (const network of Networks) {
        const updatedAccounts = state.accounts[walletId][network].map(a => ({ ...a, enabled: true }))
        accounts[walletId][network] = updatedAccounts
      }
    }

    delete state.rskLegacyDerivation

    return {
      ...state,
      accounts
    }
  }
}
