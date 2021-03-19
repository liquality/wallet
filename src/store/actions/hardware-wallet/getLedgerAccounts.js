export const getLedgerAccounts = async (
  { commit, getters },
  { network, walletId, asset, walletType, startingIndex, numAddresses }
) => {
  const client = getters.client(network, walletId, asset, walletType)
  return await client.wallet.getAddresses(startingIndex, numAddresses)
}
