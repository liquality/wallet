import { chains } from '@liquality/cryptoassets'

export const exportPrivateKey = async ({ getters }, args) => {
  const { network, walletId, accountId, chainId } = args
  console.log('here', chainId)

  const asset = chains[chainId]?.nativeAsset
  if (!asset) {
    // throw error
  }
  const client = getters.client({
    network,
    walletId,
    accountId,
    asset
  })

  console.log(client)

  return 'wtf'
}
