import { assets, chains } from '@liquality/cryptoassets'
import { getDerivationPath } from '@/utils/derivationPath'
import BN from 'bignumber.js'

export const getLedgerAccounts = async (
  { getters },
  { network, walletId, asset, accountType, startingIndex, numAccounts }
) => {
  const { client, networkAccounts, assetFiatBalance } = getters
  const { chain } = assets[asset]
  const results = []
  const existingAccounts = networkAccounts.filter((account) => {
    return account.chain === chain
  })

  const pageIndexes = [...Array(numAccounts || 5).keys()].map((i) => i + startingIndex)

  for (const index of pageIndexes) {
    const derivationPath = getDerivationPath(chain, network, index, accountType)
    // const action = chain === ChainId.Bitcoin ? 'getWalletPublicKey' : 'getAddress'
    // const ledgerAccount = await callToBridge({
    //   namespace: RequestNamespace.App,
    //   network,
    //   chainId: chain,
    //   action,
    //   execMode: ExecutionMode.Async,
    //   payload: [derivationPath]
    // })

    // const { chainCode, publicKey } = ledgerAccount
    const _client = client({
      network,
      walletId,
      asset,
      accountType,
      accountIndex: index,
      chainCode: null,
      publicKey: null,
      useCache: false
    })

    const addresses = await _client.wallet.getAddresses(0, 100)

    if (addresses && addresses.length > 0) {
      const [account] = addresses
      const normalizedAddress = chains[chain].formatAddress(account.address, network)
      const exists =
        existingAccounts.findIndex((a) => {
          if (a.addresses.length <= 0) {
            if (a.type.includes('ledger') && a.publicKey && a.chainCode) {
              const accountClient = client({
                network,
                walletId,
                asset,
                accountType,
                accountIndex: index,
                useCache: false
              })

              const [address] = accountClient.wallet.getAddresses()
              return chains[chain].formatAddress(address, network) === normalizedAddress
            }

            return false
          }

          const addresses = a.addresses.map((a) => chains[chain].formatAddress(a, network))
          return addresses.includes(normalizedAddress)
        }) >= 0

      // Get the account balance
      const balance = addresses.length === 0 ? 0 : await _client.chain.getBalance(addresses)

      const fiatBalance = BN(assetFiatBalance(asset, balance))
      const result = {
        account,
        balance,
        fiatBalance,
        index,
        exists,
        chainCode: null,
        publicKey: null,
        derivationPath
      }
      results.push(result)
    }
  }
  return results
}
