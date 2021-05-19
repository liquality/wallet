import Bluebird from 'bluebird'
import { Address } from '@liquality/types'

export const updateBalances = async ({ state, commit, getters }, { network, walletId, assets }) => {
  let accounts = state.accounts[walletId]?.[network]
                   .filter(a => a.assets && a.assets.length > 0)
  if (assets && assets.length > 0) {
    accounts = accounts.filter(a => a.assets.some(s => assets.includes(s)))
  }

  await Bluebird.map(accounts, async account => {
    const { assets, type } = account
    await Bluebird.map(assets, async asset => {
      let addresses = []
      if (type.includes('ledger')) {
        addresses = account.addresses
          .filter(a => typeof a === 'string')
          .map(address => {
            return new Address({
              address: `${address}`
            })
          })
      } else {
        addresses = await getters.client(network, walletId, asset, account.type).wallet.getUsedAddresses()
      }

      const balance = addresses.length === 0
        ? 0
        : (await getters.client(network, walletId, asset, account.type).chain.getBalance(addresses)).toNumber()

      commit('UPDATE_BALANCE', { network, accountId: account.id, walletId, asset, balance })
    }, { concurrency: 1 })
  }, { concurrency: 1 })
}
