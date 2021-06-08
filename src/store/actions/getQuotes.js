import Bluebird from 'bluebird'
import { protocols } from '../../swaps'

export const getQuotes = async ({ state, commit, getters }, { network, from, to, amount }) => {
  const quotes = await Bluebird.map(Object.entries(protocols), async ([protocolId, protocol]) => {
    const quote = await protocol.getQuote({ state, commit, getters }, { network, from, to, amount })
    return quote ? { ...quote, protocol: protocolId } : null
  }, { concurrency: 1 }) // TODO: More concurrency
  return quotes.filter(quote => quote)
}
