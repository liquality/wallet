export const disableAssets = async ({ state, commit }, { network, walletId, assets }) => {
  commit('DISABLE_ASSETS', { network, walletId, assets })
  const accounts = state.accounts[walletId]?.[network]
  accounts.forEach(account => {
    commit('DISABLE_ACCOUNT_ASSETS', { network, walletId, assets, accountId: account._id })
  })
}
