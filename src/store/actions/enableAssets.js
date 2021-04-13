export const enableAssets = async ({ commit, dispatch }, { network, walletId, assets }) => {
  commit('ENABLE_ASSETS', { network, walletId, assets })

  await dispatch('updateBalances', { network, walletId })
  await dispatch('updateFiatRates')
  await dispatch('updateMarketData', { network })
}
