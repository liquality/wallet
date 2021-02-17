import Bluebird from 'bluebird'

export const getUnusedAddresses = async ({ state, commit, getters }, { network, walletId, assets, accountId }) => {
  return Bluebird.map(assets, async asset => {
    const accounts = state.accounts[walletId]?.[network]
    const index = accounts.findIndex(a => a.id === accountId)
    if (index >= 0) {
      const account = accounts[index]
      const result = await getters.client(network, walletId, asset).wallet.getUnusedAddress()
      const address = result.address
      if (!account.addresses.includes(address)) {
        const addresses = [
          ...account.addresses,
          address
        ]
        commit('UPDATE_ACCOUNT_ADDRESSES',
          {
            network,
            accountId,
            walletId,
            asset,
            addresses
          })
      }
      return address
    }
    return ''
  }, { concurrency: 1 })
}
