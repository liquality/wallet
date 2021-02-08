export const getAccount = async ({ state }, { network, walletId, id }) => {
  const { accounts } = state
  if (accounts[walletId] && accounts[walletId][network]) {
    const index = accounts[walletId][network].findIndex(
      (account) => account.id === id
    )
    if (index >= 0) {
      return accounts[walletId][network][index]
    }
  }

  return null
}
