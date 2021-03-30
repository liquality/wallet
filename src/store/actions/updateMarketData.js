import BN from 'bignumber.js'
import cryptoassets from '../../utils/cryptoassets'

import { getMarketData } from '../utils'
import { dp } from '../../utils/coinFormatter'

export const updateMarketData = async ({ state, commit, getters }, { network }) => {
  const endpoints = getters.agentEndpoints(network)

  const _allMarketData = await Promise.all(
    endpoints.map(
      endpoint => getMarketData(endpoint).then(markets => markets.map(market => {
        market.agent = endpoint
        return market
      })).catch(e => false)
    )
  )

  const networkAssets = state.enabledAssets[network][state.activeWalletId]
  const allMarketData = _allMarketData.filter(r => r !== false)

  const pairMarkets = allMarketData[0]
    ?.filter(({ to, from }) => networkAssets.includes(to) && networkAssets.includes(from))
    ?.map(({ to, from }) => {
      return allMarketData.reduce((acc, marketData) => {
        const convert = cryptoassets[from]
        const market = marketData.find(market => market.to === to && market.from === from)
        if (!market) return acc

        market.sellRate = BN(market.rate).toString()
        market.buyRate = dp(BN(1).div(market.sellRate), from).toString()

        market.sellMin = BN(convert.unitToCurrency(market.min)).toString()
        market.sellMax = BN(convert.unitToCurrency(market.max)).toString()

        acc.buyRate = dp(BN.min(acc.buyRate, market.buyRate), from).toString()
        acc.sellRate = dp(BN.min(acc.sellRate, market.sellRate), to).toString()
        acc.sellMin = dp(BN.min(acc.sellMin, market.sellMin), to).toString()
        acc.sellMax = dp(BN.max(acc.sellMax, market.sellMax), to).toString()

        acc.markets.push(market)

        return acc
      }, {
        to,
        from,

        buyRate: Infinity,
        sellRate: Infinity,
        sellMin: Infinity,
        sellMax: -Infinity,

        markets: []
      })
    }) || []

  const marketData = networkAssets.reduce((acc, asset) => {
    acc[asset] = pairMarkets
      .filter(market => {
        return market.from === asset
      })
      .reduce((acc, market) => {
        market.markets.sort((a, b) => BN(a).minus(b).toNumber())

        acc[market.to] = market

        const to = market.to
        delete acc[to].to
        delete acc[to].from

        return acc
      }, {})

    return acc
  }, {})

  commit('UPDATE_MARKET_DATA', { network, marketData })

  return {
    network, marketData
  }
}
