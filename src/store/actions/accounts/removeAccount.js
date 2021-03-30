export const removeAccount = async ({ commit }, { walletId, id }) => {
  commit('REMOVE_ACCOUNT', { walletId, id })
  return id
}
