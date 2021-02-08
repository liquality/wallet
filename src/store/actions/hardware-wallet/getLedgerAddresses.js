export const getLedgerAddresses = async (
  { commit, getters },
  { network, walletId, asset, walletType }
) => {
  const client = getters.client(network, walletId, asset, walletType)
  const addresses = await client.wallet.getAddresses()
  return addresses
}
