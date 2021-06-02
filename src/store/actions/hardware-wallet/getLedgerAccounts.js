
import { assets } from '@liquality/cryptoassets'

export const getLedgerAccounts = async (
  { commit, getters },
  { network, walletId, asset, walletType, startingIndex, numAccounts }
) => {
  const { client, networkAccounts } = getters
  const { chain } = assets[asset]
  const results = []
  const usedAddresses = []

  const existingAccounts = networkAccounts.filter(account => {
    return account.chain === chain
  })

  // get all the used addresses in the same chain
  for (const account of existingAccounts) {
    if (account.type.includes('ledger')) {
      usedAddresses.push(...account.addresses)
    } else {
      const _client = client(network, walletId, asset, account.type, account.index)
      const addresses = await _client.wallet.getUsedAddresses()
      usedAddresses.push(...addresses.map(a => a.address))
    }
  }

  const pageIndexes = [...Array(numAccounts || 5).keys()].map(i => i + startingIndex)
  for (const index of pageIndexes) {
    const _client = client(network, walletId, asset, walletType, index)
    const addresses = await _client.wallet.getAddresses()
    if (addresses && addresses.length > 0) {
      results.push({
        account: addresses[0],
        index: index + startingIndex,
        exists: usedAddresses.includes(addresses[0].address)
      })
    }
  }
  return results
}
