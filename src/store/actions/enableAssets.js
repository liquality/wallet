export const enableAssets = async ({ commit, dispatch }, { network, walletId, assets }) => {
  commit('ENABLE_ASSETS', { network, walletId, assets })
  dispatch('updateBalances', { network, walletId })
  dispatch('updateFiatRates')
}
