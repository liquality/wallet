export const removeAccount = async ({ commit }, { network, walletId, id }) => {
  commit('REMOVE_ACCOUNT', { network, walletId, id })
  return id
}
