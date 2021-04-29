export const getLedgerAccounts = async (
  { commit, getters },
  { network, walletId, asset, walletType, startingIndex, numAccounts }
) => {
  const client = getters.client(network, walletId, asset, walletType)
  return await client.wallet.getAddresses()
}
