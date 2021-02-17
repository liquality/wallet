import Bluebird from 'bluebird'

export const getUnusedAddresses = async ({ state, commit, getters }, { network, walletId, assets, accountId }) => {
  return Bluebird.map(assets, async asset => {
    const accounts = state.accounts[walletId]?.[network]
    const index = accounts.findIndex(a => a.id === accountId)
    if (index >= 0) {
      const result = await getters.client(network, walletId, asset).wallet.getUnusedAddress()
      const address = result.address

      commit('UPDATE_UNUSED_ADDRESS', { network, walletId, asset, address })

      return address
    }
    return ''
  }, { concurrency: 1 })
}
