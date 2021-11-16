import { getPrices } from '../utils'

export const updateFiatRates = async ({ commit, state }, { assets }) => {
  const fiatRates = await getPrices(assets, 'usd', state.activeNetwork)

  commit('UPDATE_FIAT_RATES', { fiatRates })

  return fiatRates
}
