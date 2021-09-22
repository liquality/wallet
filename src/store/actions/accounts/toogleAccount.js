export const toogleAccount = async ({ commit }, { network, walletId, accountId, enable }) => {
  commit('TOOGLE_ACCOUNT', { network, walletId, accountId, enable })
}
