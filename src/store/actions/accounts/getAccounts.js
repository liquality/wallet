export const getAccounts = async ({ state }, { walletId }) => {
  const { accounts } = state
  return accounts[walletId]
}
