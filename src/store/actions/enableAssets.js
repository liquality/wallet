export const enableAssets = async ({ state, commit, dispatch }, { network, walletId, assets }) => {
  commit('ENABLE_ASSETS', { network, walletId, assets })
  const accounts = state.accounts[walletId]?.[network]
  accounts.forEach(account => {
    const accountId = account.id
    commit('ENABLE_ACCOUNT_ASSETS', { network, walletId, assets, accountId })
    dispatch('updateAccountBalance', { network, walletId, accountId })
  })
  dispatch('updateFiatRates')
  dispatch('updateMarketData', { network })
}
