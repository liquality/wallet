import Bluebird from 'bluebird'
import buildConfig from '../../build.config'

export const getQuotes = async ({ state, commit, getters }, { network, from, to, amount }) => {
  const quotes = await Bluebird.map(Object.keys(buildConfig.swapProviders[network]), async provider => {
    console.log(provider)
    console.log('getQuotes')
    const swapProvider = getters.swapProvider(network, provider)
    console.log(swapProvider)
    console.log('before quote')
    const quote = await swapProvider.getQuote({ network, from, to, amount })
    console.log('after quote data high level')
    console.log(quote)
    return quote ? { ...quote, provider } : null
  }, { concurrency: 5 })
  return quotes.filter(quote => quote)
}
