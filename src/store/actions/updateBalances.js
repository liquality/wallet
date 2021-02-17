import Bluebird from 'bluebird'
import { Address } from '@liquality/utils'

export const updateBalances = async ({ state, commit, getters }, { network, walletId }) => {
  const accounts = state.accounts[walletId]?.[network]

  if (accounts) {
    await Bluebird.map(accounts, async account => {
      const { assets, type } = account
      assets.forEach(async asset => {
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
        const filtered = addresses.filter(a => {
          return !account.addresses.includes(a.address)
        }).map(a => a.address)
        console.log(filtered)
        const mergedAddresses = [
          ...account.addresses,
          ...addresses.filter(a => {
            return !account.addresses.includes(a.address)
          }).map(a => a.address)]
        commit('UPDATE_BALANCE', { network, accountId: account.id, walletId, asset, balance })
        commit('UPDATE_ACCOUNT_ADDRESSES', { network, accountId: account.id, walletId, asset, addresses: mergedAddresses })
      })
    }, { concurrency: 1 })
  }
}
