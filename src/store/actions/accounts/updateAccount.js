export const updateAccount = async ({ commit }, { network, walletId, account }) => {
  const updatedAt = Date.now()
  const updatedAccount = {
    ...account,
    updatedAt
  }
  commit('UPDATE_ACCOUNT', { network, walletId, account: updatedAccount })
  return updatedAccount
}
