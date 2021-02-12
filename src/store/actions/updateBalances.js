import Bluebird from 'bluebird'
import { Address } from '@liquality/utils'

export const updateBalances = async ({ state, commit, getters }, { network, walletId }) => {
  const accounts = state.accounts[walletId]?.[network]

  if (accounts) {
    await Bluebird.map(accounts, async account => {
      const { assets } = account
      assets.forEach(async asset => {
        const addresses = account.addresses.map(address => {
          return new Address({
            address
          })
        })
        const balance = addresses.length === 0
          ? 0
          : (await getters.client(network, walletId, asset, account.type).chain.getBalance(addresses)).toNumber()
        commit('UPDATE_BALANCE', { network, accountId: account.id, walletId, asset, balance })
      })
    }, { concurrency: 1 })
  }
}
