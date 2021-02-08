export const getAccounts = async ({ state }, { network, walletId }) => {
  const { accounts } = state
  if (accounts[walletId] && accounts[walletId][network]) {
    return accounts[walletId][network]
  }
  return []
}
