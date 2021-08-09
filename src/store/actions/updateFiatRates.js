import { getPrices } from '../utils'

export const updateFiatRates = async ({ commit }, { assets }) => {
  console.log('updating fiat rates', assets)
  const fiatRates = await getPrices(assets, 'usd')

  commit('UPDATE_FIAT_RATES', { fiatRates })

  return fiatRates
}
