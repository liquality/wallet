export const updateAccountBalance = async ({ state, commit, getters }, { network, walletId, accountId, useAccountType = true }) => {
  const accounts = state.accounts[walletId]?.[network]
  const index = accounts?.findIndex(a => a.id === accountId)
  if (index >= 0) {
    const account = accounts[index]
    const { assets, type } = account

    const accountType = useAccountType ? type : 'default'
    assets.forEach(async asset => {
      const addresses = await getters.client(network, walletId, asset, accountType).wallet.getUsedAddresses()
      const balance = addresses.length === 0
        ? 0
        : (await getters.client(network, walletId, asset, accountType).chain.getBalance(addresses)).toNumber()

      commit('UPDATE_BALANCE', { network, accountId: account.id, walletId, asset, balance })

      if (accountType.includes('ledger')) {
        const filtered = addresses.filter(a => {
          return !account.addresses.includes(a.address)
        }).map(a => a.address)

        if (filtered.length > 0) {
          commit('UPDATE_ACCOUNT_ADDRESSES',
            {
              network,
              accountId: account.id,
              walletId,
              asset,
              addresses:
              [
                ...account.addresses,
                ...filtered
              ]
            })
        }
      }
    })
  }
}
