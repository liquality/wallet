import Bluebird from 'bluebird'

export const updateBalances = async ({ state, commit, getters }, { network, walletId }) => {
  const assets = state.enabledAssets[network][walletId]

  await Bluebird.map(assets, async asset => {
    const addresses = await getters.client(network, walletId, asset).wallet.getUsedAddresses()
    const balance = addresses.length === 0
      ? 0
      : (await getters.client(network, walletId, asset).chain.getBalance(addresses)).toNumber()

    commit('UPDATE_BALANCE', { network, walletId, asset, balance })
  }, { concurrency: 1 })
}
