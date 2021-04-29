export const updateAccount = async ({ commit }, { network, walletId, account }) => {
  const updatedAt = Date.now()
  const updatedAccount = {
    ...account,
    updatedAt
  }
  commit('UPDATED_ACCOUNT', { network, walletId, account: updatedAccount })
  return updatedAccount
}
