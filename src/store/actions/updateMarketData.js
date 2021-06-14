import _ from 'lodash'
import { getSwapProtocol } from '../../utils/swaps'
import buildConfig from '../../build.config'

// TODO: better name?
export const updateMarketData = async ({ state, commit, getters }, { network }) => {
  const supportedPairResponses = await Promise.all(Object.keys(buildConfig.swapProtocols[network]).map(protocol => {
    return getSwapProtocol(network, protocol)
      .getSupportedPairs({ state, commit, getters }, { network, protocol })
      .then(pairs => pairs.map(pair => ({ ...pair, protocol })))
  }))
  const supportedPairs = _.flatten(supportedPairResponses)

  const marketData = supportedPairs

  commit('UPDATE_MARKET_DATA', { network, marketData })

  return { network, marketData }
}
