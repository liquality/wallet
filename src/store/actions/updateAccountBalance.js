import { Address } from '@liquality/utils'

export const updateAccountBalance = async ({ state, commit, getters }, { network, walletId, accountId }) => {
  const accounts = state.accounts[walletId]?.[network]
  const index = accounts?.findIndex(a => a.id === accountId)
  if (index >= 0) {
    const account = accounts[index]
    const { assets, type } = account
    for (const asset of assets) {
      let addresses = []
      if (type.includes('ledger')) {
        addresses = account.addresses.map(a => new Address({
          address: `${a}`
        }))
      } else {
        addresses = await getters.client(network, walletId, asset).wallet.getUsedAddresses()
      }
      const balance = addresses.length === 0
        ? 0
        : (await getters.client(network, walletId, asset, type).chain.getBalance(
          addresses
        )).toNumber()

      commit('UPDATE_BALANCE', { network, accountId: account.id, walletId, asset, balance })
    }
  }
}
