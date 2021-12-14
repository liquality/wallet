export const initializeAddresses = async ({ state, dispatch }, { network, walletId }) => {
  const accounts = state.accounts[walletId]?.[network]
  for (const account of accounts) {
    if (!account.type.includes('ledger') && !account.xPub) {
      await dispatch('getUnusedAddresses', { network, walletId, assets: account.assets, accountId: account.id })
    }
  }
}
