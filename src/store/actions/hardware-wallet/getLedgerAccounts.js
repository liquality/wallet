
import { assets, chains, ChainId } from '@liquality/cryptoassets'
import { callToBridge, getXPubVersion } from '@/utils/ledger-bridge-provider'
import { getDerivationPath } from '@/utils/derivationPath'
import {
  RequestNamespace,
  ExecutionMode
} from '@liquality/hw-web-bridge'
import BN from 'bignumber.js'

export const getLedgerAccounts = async (
  { getters },
  { network, walletId, asset, accountType, startingIndex, numAccounts }
) => {
  const { client, networkAccounts, assetFiatBalance } = getters
  const { chain } = assets[asset]
  const results = []
  const existingAccounts = networkAccounts.filter(account => {
    return account.chain === chain
  })

  const pageIndexes = [...Array(numAccounts || 5).keys()].map(i => i + startingIndex)
  const xpubVersion = getXPubVersion(network)
  let xPub = null

  // For BTC we need to get the xPub to store it
  // and then we don't need to call again the ledger device to get all addresses
  if (chain === ChainId.Bitcoin) {
    const path = getDerivationPath(chain, network, 0, accountType)
    xPub = await callToBridge({
      namespace: RequestNamespace.App,
      network,
      chainId: chain,
      action: 'getWalletXpub',
      execMode: ExecutionMode.Async,
      payload: [{ path, xpubVersion }]
    })
  }

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
      const normalizedAddress = chains[chain].formatAddress(account.address, network)
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
            return chains[chain].formatAddress(address, network) === normalizedAddress
          }

          return false
        }

        const addresses = a.addresses.map(a => chains[chain].formatAddress(a, network))
        return addresses.includes(normalizedAddress)
      }
      ) >= 0

      // Get the account balance
      const balance = addresses.length === 0
        ? 0
        : (await _client.chain.getBalance(
          addresses
        ))

      const fiatBalance = BN(assetFiatBalance(asset, balance))
      const result = {
        account,
        balance,
        fiatBalance,
        index,
        exists,
        xPub
      }
      results.push(result)
    }
  }
  return results
}
