import Bluebird from 'bluebird'
import { Address } from '@liquality/types'

export const updateBalances = async ({ state, commit, getters }, { network, walletId, assets }) => {
  let accounts = state.accounts[walletId]?.[network]
    .filter(a => a.assets && a.assets.length > 0)
  if (assets && assets.length > 0) {
    accounts = accounts.filter(a => a.assets.some(s => assets.includes(s)))
  }
  const { client } = getters

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
        addresses = await client(
          {
            network,
            walletId,
            asset,
            accountId: account.id
          }
        ).wallet.getUsedAddresses()
      }

      const balance = addresses.length === 0
        ? 0
        : (await client(
          {
            network,
            walletId,
            asset,
            accountId: account.id
          }
        ).chain.getBalance(addresses)).toNumber()

      commit('UPDATE_BALANCE', { network, accountId: account.id, walletId, asset, balance })

      const addressExists = addresses.some(a => account.addresses.includes(a.address))
      if (!addressExists) {
        // TODO: update cryptoassets to export ChainId.Bitcoin
        const _addresses = account.chain === 'bitcoin' ? [...account.addresses, ...addresses.map(a => a.address)] : [...addresses.map(a => a.address)]
        // for bitcoin we need to add new addresses to track the balance
        commit('UPDATE_ACCOUNT_ADDRESSES',
          {
            network,
            accountId: account.id,
            walletId,
            asset,
            addresses: _addresses
          })
      }
    }, { concurrency: 1 })
  }, { concurrency: 1 })
}
