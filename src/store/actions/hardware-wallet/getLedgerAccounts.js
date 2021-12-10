
import { assets } from '@liquality/cryptoassets'
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
      const exists = existingAccounts.findIndex((a) => {
        if (a.addresses.length <= 0) {
          if (a.type.includes('ledger')) {
            const accountClient = client(
              {
                network,
                walletId,
                asset,
                accountType,
                accountIndex: index,
                useCache: false
              }
            )

            const [address] = accountClient.wallet.getAddresses(0, 1)
            return address === account.address
          }

          return false
        }
        return a.addresses[0] === account.address
      }
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
