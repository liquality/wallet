import { timestamp } from '../utils'

export const checkIfQuoteExpired = async ({ commit }, { network, walletId, order }) => {
  if (timestamp() >= order.expiresAt) {
    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id: order.id,
      updates: {
        status: 'QUOTE_EXPIRED'
      }
    })

    return true
  }

  return false
}
