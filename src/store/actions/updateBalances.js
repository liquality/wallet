import { NetworkAssets } from '../factory/client'

export const updateBalances = async ({ commit, getters }, { network, walletId }) => {
  const assets = NetworkAssets[network]

  return Promise.all(assets
    .map(async asset => {
      const addresses = await getters.client(network, walletId, asset).wallet.getUsedAddresses()
      const balance = await getters.client(network, walletId, asset).chain.getBalance(addresses)

      commit('UPDATE_BALANCE', { network, walletId, asset, balance })
    }))
}
