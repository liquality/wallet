export const removeExistingLedgerAccounts = {
  version: 17,
  migrate: async (state) => {
    const accounts = {}

    for (const walletId in state.accounts) {
      if (!accounts[walletId]) {
        accounts[walletId] = {}
      }
      for (const network in state.accounts[walletId]) {
        accounts[walletId][network] = state.accounts[walletId][network].filter((a) => {
          return !a.type?.includes('ledger')
        })
      }
    }

    return {
      ...state,
      accounts
    }
  }
}
