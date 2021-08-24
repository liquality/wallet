import Bluebird from 'bluebird'
import { isEthereumChain } from '@/utils/asset'
import { ChainId } from '@liquality/cryptoassets'

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
      let updatedAddresses = []
      if (account.chain === ChainId.Bitcoin) {
        if (!account.addresses.includes(address)) {
          updatedAddresses = [...account.addresses, address]
        } else {
          updatedAddresses = [...account.addresses]
        }
      } else {
        updatedAddresses = [address]
      }

      commit('UPDATE_ACCOUNT_ADDRESSES',
        {
          network,
          accountId: account.id,
          walletId,
          asset,
          addresses: updatedAddresses
        })

      return address
    }
    return ''
  }, { concurrency: 1 })
}
