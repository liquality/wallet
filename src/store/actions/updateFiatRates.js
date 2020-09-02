import { getPrices } from '../utils'
import { NetworkAssets } from '../factory/client'

export const updateFiatRates = async ({ commit }) => {
  const assets = NetworkAssets.mainnet.concat(NetworkAssets.testnet)
  const fiatRates = await getPrices(assets, 'usd')

  commit('UPDATE_FIAT_RATES', { fiatRates })

  return fiatRates
}
