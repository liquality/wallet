import Bluebird from 'bluebird'

export const updateBalances = async ({ state, commit, getters }, { network, walletId }) => {
  const accounts = state.accounts[walletId][network]
  await Bluebird.map(accounts, async account => {
    const { assets } = account
    assets.forEach(async asset => {
      const addresses = await getters.client(network, walletId, asset).wallet.getUsedAddresses()
      const balance = addresses.length === 0
        ? 0
        : (await getters.client(network, walletId, asset, account.type).chain.getBalance(addresses)).toNumber()
      commit('UPDATE_BALANCE', { network, accountId: account.id, walletId, asset, balance })
    })
  }, { concurrency: 1 })
}
