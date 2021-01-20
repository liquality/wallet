export const disableAssets = async ({ commit }, { network, walletId, assets }) => {
  commit('DISABLE_ASSETS', { network, walletId, assets })
}
