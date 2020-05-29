export const changeActiveWalletId = async ({ commit }, { walletId }) => {
  commit('CHANGE_ACTIVE_WALLETID', { walletId })
}
