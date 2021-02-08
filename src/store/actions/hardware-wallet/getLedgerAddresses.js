export const getLedgerAddresses = async (
  { state, commit, getters },
  { asset, walletType }
) => {
  const { activeNetwork, activeWalletId } = state
  const client = getters.client(activeNetwork, activeWalletId, asset, walletType)
  const addresses = await client.wallet.getAddresses()
  return addresses
}
