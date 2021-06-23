import Bluebird from 'bluebird'
import buildConfig from '../../build.config'

export const getQuotes = async ({ state, commit, getters }, { network, from, to, amount }) => {
  const quotes = await Bluebird.map(Object.keys(buildConfig.swapProviders[network]), async provider => {
    const swapProvider = getters.swapProvider(network, provider)
    const quote = await swapProvider.getQuote({ network, from, to, amount })
    return quote ? { ...quote, provider } : null
  }, { concurrency: 5 })
  return quotes.filter(quote => quote)
}
