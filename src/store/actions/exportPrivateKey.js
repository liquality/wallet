import { chains } from '@liquality/cryptoassets'

export const exportPrivateKey = async ({ getters }, args) => {
  const { network, walletId, accountId, chainId } = args

  const asset = chains[chainId]?.nativeAsset
  if (!asset) {
    throw new Error(`missing nativeAsset for ${chainId}`)
  }

  const client = getters.client({
    network,
    walletId,
    accountId,
    asset
  })

  return client.wallet.exportPrivateKey()
}
