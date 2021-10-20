export const exportPrivateKey = async ({ getters }, args) => {
  const { network, walletId, accountId, chainId } = args
  console.log('here', this, args)

  const client = getters.client({
    network,
    walletId,
    accountId,
    asset: `FIXME-${chainId}`
  })

  console.log(client)

  return 'wtf'
};
