
export const getLedgerAccounts = async (
  { commit, getters },
  { network, walletId, asset, walletType, startingIndex, numAccounts }
) => {
  const results = []
  const indexes = [...Array(numAccounts || 5).keys()].map(i => i + startingIndex)
  for (const index of indexes) {
    const client = getters.client(network, walletId, asset, walletType, index)
    const addresses = await client.wallet.getAddresses()
    if (addresses && addresses.length > 0) {
      results.push(addresses[0])
    }
  }
  return results
}
