import Bluebird from 'bluebird'
import { Address } from '@liquality/types'

export const updateBalances = async ({ state, commit, getters }, { network, walletId }) => {
  const accounts = state.accounts[walletId]?.[network]
                   .filter(a => a.assets && a.assets.length > 0) || []

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

        commit('UPDATE_BALANCE', { network, accountId: account.id, walletId, asset, balance })
        // we need to add the new accounts to keep track of them
        if (type.includes('ledger')) {
          const filtered = addresses.filter(a => {
            return !account.addresses.includes(a.address)
          }).map(a => a.address)

          if (filtered.length > 0) {
            commit('UPDATE_ACCOUNT_ADDRESSES',
              {
                network,
                accountId: account.id,
                walletId,
                asset,
                addresses:
            [
              ...account.addresses,
              ...filtered
            ]
              })
          }
        }
      })
    }, { concurrency: 1 })
  }
}
