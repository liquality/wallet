import Bluebird from 'bluebird'
import { NetworkAssets } from '../factory/client'

export const updateBalances = async ({ commit, getters }, { network, walletId }) => {
  const assets = NetworkAssets[network]

  return Bluebird.map(assets, async asset => {
    const addresses = await getters.client(network, walletId, asset).wallet.getUsedAddresses()
    const balance = addresses.length === 0
      ? 0
      : (await getters.client(network, walletId, asset).chain.getBalance(addresses)).toNumber()

    commit('UPDATE_BALANCE', { network, walletId, asset, balance })
  }, { concurrency: 1 })
}
