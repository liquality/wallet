import Bluebird from 'bluebird'
import { getSwapProtocol } from '../../utils/swaps'
import buildConfig from '../../build.config'

export const getQuotes = async ({ state, commit, getters }, { network, from, to, amount }) => {
  const quotes = await Bluebird.map(Object.keys(buildConfig.swapProtocols[network]), async protocol => {
    const quote = await getSwapProtocol(network, protocol).getQuote({ state, commit, getters }, { network, protocol, from, to, amount })
    return quote ? { ...quote, protocol } : null
  }, { concurrency: 5 })
  return quotes.filter(quote => quote)
}
