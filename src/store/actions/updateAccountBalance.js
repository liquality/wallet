import { Address } from '@liquality/types'
import { ChainId } from '@liquality/cryptoassets'

export const updateAccountBalance = async (
  { state, commit, getters },
  { network, walletId, accountId }
) => {
  const accounts =
    state.accounts[walletId]?.[network].filter(
      (a) => a.assets && a.assets.length > 0 && a.enabled
    ) || []
  const index = accounts?.findIndex((a) => a.id === accountId)
  if (index >= 0) {
    const account = accounts[index]
    const { assets, type, chain } = account
    assets.forEach(async (asset) => {
      const _client = getters.client({
        network,
        walletId,
        asset,
        accountId
      })
      let addresses = []
      if (type.includes('ledger')) {
        if (chain === ChainId.Bitcoin) {
          if (account.chainCode && account.publicKey) {
            addresses = await _client.wallet.getUsedAddresses()
          } else {
            addresses = account.addresses.map(
              (a) =>
                new Address({
                  address: `${a}`
                })
            )
          }
        } else {
          addresses = account.addresses.map(
            (a) =>
              new Address({
                address: `${a}`
              })
          )
        }
      } else {
        addresses = await _client.wallet.getUsedAddresses()
      }
      const balance =
        addresses.length === 0 ? 0 : (await _client.chain.getBalance(addresses)).toString()

      commit('UPDATE_BALANCE', {
        network,
        accountId,
        walletId,
        asset,
        balance
      })

      // Commit to the state the addresses
      let updatedAddresses = []
      if (account.chain === ChainId.Bitcoin) {
        const _addresses = addresses
          .filter((a) => !account.addresses.includes(a.address))
          .map((a) => a.address)
        updatedAddresses = [...account.addresses, ..._addresses]
      } else {
        updatedAddresses = [...addresses.map((a) => a.address)]
      }

      commit('UPDATE_ACCOUNT_ADDRESSES', {
        network,
        accountId,
        walletId,
        asset,
        addresses: updatedAddresses
      })
    })
  }
}
