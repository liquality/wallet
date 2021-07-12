import _ from 'lodash'
import buildConfig from '../../build.config'

export const updateMarketData = async ({ state, commit, getters }, { network }) => {
  const supportedPairResponses = await Promise.all(Object.keys(buildConfig.swapProviders[network]).map(provider => {
    const swapProvider = getters.swapProvider(network, provider)
    return swapProvider
      .getSupportedPairs({ network })
      .then(pairs => pairs.map(pair => ({ ...pair, provider })))
  }))
  const supportedPairs = _.flatten(supportedPairResponses)

  const marketData = supportedPairs

  commit('UPDATE_MARKET_DATA', { network, marketData })

  return { network, marketData }
}
