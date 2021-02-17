export const updateAccountBalance = async ({ state, commit, getters }, { network, walletId, accountId }) => {
  const accounts = state.accounts[walletId]?.[network]
  const index = accounts.findIndex(a => a.id === accountId)
  if (index >= 0) {
    const account = accounts[index]
    const { assets, type } = account

    assets.forEach(async asset => {
      const addresses = await getters.client(network, walletId, asset, type).wallet.getUsedAddresses()
      const balance = addresses.length === 0
        ? 0
        : (await getters.client(network, walletId, asset, type).chain.getBalance(addresses)).toNumber()
      const mergedAddresses = addresses.filter(a => {
        return !account.addresses.includes(a.address)
      }).map(a => a.address)
      commit('UPDATE_BALANCE', { network, accountId: account.id, walletId, asset, balance })
      commit('UPDATE_ACCOUNT_ADDRESSES', { network, accountId: account.id, walletId, asset, addresses: mergedAddresses })
    })
  }
}
