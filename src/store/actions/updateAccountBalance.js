import { Address } from '@liquality/types'

export const updateAccountBalance = async ({ state, commit, getters }, { network, walletId, accountId }) => {
  const accounts = state.accounts[walletId]?.[network]
    .filter(a => a.assets && a.assets.length > 0 && a.enabled) || []
  const index = accounts?.findIndex(a => a.id === accountId)
  if (index >= 0) {
    const account = accounts[index]
    const { assets, type } = account
    assets.forEach(async asset => {
      const _client = getters.client(
        {
          network,
          walletId,
          asset,
          accountId
        }
      )
      let addresses = []
      if (type.includes('ledger')) {
        addresses = account.addresses.map(a => new Address({
          address: `${a}`
        }))
      } else {
        addresses = await _client.wallet.getUsedAddresses()
      }
      const balance = addresses.length === 0
        ? 0
        : (await _client.chain.getBalance(
          addresses
        )).toNumber()

      commit('UPDATE_BALANCE', { network, accountId, walletId, asset, balance })
    })
  }
}
