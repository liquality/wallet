import Bluebird from 'bluebird'

export const getUnusedAddresses = async ({ commit, getters }, { network, walletId, assets }) => {
  return Bluebird.map(assets, async asset => {
    const result = await getters.client(network, walletId, asset).wallet.getUnusedAddress()
    const address = result.address

    commit('UPDATE_UNUSED_ADDRESS', { network, walletId, asset, address })

    return address
  }, { concurrency: 1 })
}
