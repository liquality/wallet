export const updateAccount = async ({ commit }, { id, account }) => {
  const updatedAt = Date.now()
  const updatedAccount = {
    ...account,
    updatedAt
  }
  commit('UPDATED_ACCOUNT', updatedAccount)
  return updatedAccount
}
