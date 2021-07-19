import Bluebird from 'bluebird'
import { isEthereumChain } from '@/utils/asset'

export const getUnusedAddresses = async ({ state, commit, getters }, { network, walletId, assets, accountId }) => {
  return Bluebird.map(assets, async asset => {
    const accounts = state.accounts[walletId]?.[network]
    const index = accounts.findIndex(a => a.id === accountId)
    if (index >= 0 && asset) {
      const account = accounts[index]
      const result = await getters.client(
        {
          network,
          walletId,
          asset,
          accountId: account.id
        }
      ).wallet.getUnusedAddress()
      const address = isEthereumChain(asset) ? result.address.replace('0x', '') : result.address // TODO: Should not require removing 0x
      if (!account.addresses.includes(address)) {
        const addresses = [
          ...account.addresses,
          address
        ]
        commit('UPDATE_ACCOUNT_ADDRESSES',
          {
            network,
            accountId,
            walletId,
            asset,
            addresses
          })
      }
      return address
    }
    return ''
  }, { concurrency: 1 })
}
