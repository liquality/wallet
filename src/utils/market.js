import axios from 'axios'
import BN from 'bignumber.js'
import cryptoassets from '@liquality/cryptoassets'

import agents from './agents'
import { dp } from './coinFormatter'

export default isTestnet => async supportedCoins => {
  const allMarketData = await Promise.all(agents(isTestnet).map(agent => axios({
    url: `${agent}/marketinfo`,
    headers: {
      'x-requested-with': 'wallet',
      'x-liquality-user-agent': 'wallet'
    }
  }).then(res => res.data)))

  const pairMarkets = allMarketData[0]
    .filter(({ to, from }) => supportedCoins.includes(to) && supportedCoins.includes(from))
    .map(({ to, from }) => {
      return allMarketData.reduce((acc, marketData, index) => {
        const convert = cryptoassets[from.toLowerCase()]
        const market = marketData.find(market => market.to === to && market.from === from)
        if (!market) return acc

        market.agentIndex = index

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
    })

  const val = supportedCoins.reduce((acc, coin) => {
    acc[coin] = pairMarkets
      .filter(market => market.to === coin)
      .reduce((acc, market) => {
        market.markets.sort((a, b) => BN(a).minus(b).toNumber())

        acc[market.from] = market

        delete acc[market.from].to
        delete acc[market.from].from

        return acc
      }, {})

    return acc
  }, {})

  return val
}
