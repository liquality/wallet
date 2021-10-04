export const toggleAccount = async ({ commit }, { network, walletId, accountId, enable }) => {
  commit('TOGGLE_ACCOUNT', { network, walletId, accountId, enable })
}
