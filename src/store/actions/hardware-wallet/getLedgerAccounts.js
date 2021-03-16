export const getLedgerAccounts = async (
  { commit, getters },
  { network, walletId, asset, walletType, from, to }
) => {
  const client = getters.client(network, walletId, asset, walletType)
  return await client.wallet.getAddresses(from, to)
}
