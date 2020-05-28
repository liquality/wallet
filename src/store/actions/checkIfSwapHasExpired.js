import { timestamp } from '../utils'

export const checkIfSwapHasExpired = async ({ commit }, { network, walletId, order }) => {
  if (timestamp() >= order.nodeSwapExpiration) {
    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id: order.id,
      updates: {
        status: 'GET_REFUND'
      }
    })

    return true
  }

  return false
}
