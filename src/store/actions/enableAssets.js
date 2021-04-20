export const enableAssets = async ({ state, commit, dispatch }, { network, walletId, assets }) => {
  commit('ENABLE_ASSETS', { network, walletId, assets })
  const accounts = state.accounts[walletId]?.[network]
  accounts.forEach(account => {
    commit('ENABLE_ACCOUNT_ASSETS', { network, walletId, assets, accountId: account.id })
  })
  dispatch('updateBalances', { network, walletId })
  dispatch('updateFiatRates')
  dispatch('updateMarketData', { network })
}
