
import { assets, ChainId } from '@liquality/cryptoassets'
export const getLedgerAccounts = async (
  { getters },
  { network, walletId, asset, accountType, startingIndex, numAccounts }
) => {
  const { client, networkAccounts } = getters
  const { chain } = assets[asset]
  const results = []

  const existingAccounts = networkAccounts.filter(account => {
    return account.chain === chain
  })

  const pageIndexes = [...Array(numAccounts || 5).keys()].map(i => i + startingIndex)
  for (const index of pageIndexes) {
    const _client = client(
      {
        network,
        walletId,
        asset,
        accountType,
        accountIndex: index,
        useCache: false
      }
    )
    const addresses = await _client.wallet.getAddresses()
    if (addresses && addresses.length > 0) {
      const account = addresses[0]
      // For bitcoin we use the base derivation path
      // Example: derivation path "84'/0'/0'/0/0" => base  "84'/0'/0'"
      const pathToCompare = chain === ChainId.Bitcoin ? account.derivationPath.substr(0, account.derivationPath.length - 4) : account.derivationPath
      const exists = existingAccounts.findIndex(
        a => a.derivationPath === pathToCompare
      ) >= 0

      results.push({
        account,
        index,
        exists
      })
    }
  }
  return results
}
