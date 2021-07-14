import Bluebird from 'bluebird'
import buildConfig from '../../build.config'

export const getQuotes = async ({ state, commit, getters }, { network, from, to, fromAccountId, toAccountId, amount }) => {
  const quotes = await Bluebird.map(Object.keys(buildConfig.swapProviders[network]), async provider => {
    const swapProvider = getters.swapProvider(network, provider)
    // Quote errors should not halt the process
    const quote = await swapProvider.getQuote({ network, from, to, amount }).catch(console.error)
    return quote ? { ...quote, provider, fromAccountId, toAccountId } : null
  }, { concurrency: 5 })
  return quotes.filter(quote => quote)
}
