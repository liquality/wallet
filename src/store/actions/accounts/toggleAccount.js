export const toggleAccount = async ({ commit, dispatch }, { network, walletId, accountId, enable }) => {
  commit('TOGGLE_ACCOUNT', { network, walletId, accountId, enable })
  if (enable) {
    await dispatch('updateAccountBalance', {
      network,
      walletId,
      accountId
    })
  }
}
