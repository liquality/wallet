import { Networks, getPrices } from '../utils'
import { uniq } from 'lodash-es'

export const updateFiatRates = async ({ state, commit }) => {
  const assets = Networks.reduce((result, network) => {
    return uniq(result.concat(state.enabledAssets[network][state.activeWalletId]))
  }, [])
  const fiatRates = await getPrices(assets, 'usd')

  commit('UPDATE_FIAT_RATES', { fiatRates })

  return fiatRates
}
