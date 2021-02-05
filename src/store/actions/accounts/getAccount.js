export const getAccount = async ({ state }, { walletId, id }) => {
  const { accounts } = state
  const index = accounts[walletId].findIndex(
    (account) => account.id === id
  )

  if (index >= 0) {
    return accounts[walletId][index]
  }

  return null
}
