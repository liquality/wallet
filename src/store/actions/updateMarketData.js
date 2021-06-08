import _ from 'lodash'
import { protocols } from '../../swaps'

// TODO: better name?
export const updateMarketData = async ({ state, commit, getters }, { network }) => {
  const supportedPairResponses = await Promise.all(Object.entries(protocols).map(([protocolId, protocol]) => {
    return protocol.getSupportedPairs({ state, commit, getters }, { network }).then(pairs => pairs.map(pair => ({ ...pair, protocol: protocolId })))
  }))
  const supportedPairs = _.flatten(supportedPairResponses)

  const marketData = supportedPairs

  commit('UPDATE_MARKET_DATA', { network, marketData })

  return { network, marketData }
}
