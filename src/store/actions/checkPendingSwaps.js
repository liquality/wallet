import { Networks } from '../factory/client'

const COMPLETED_STATES = [
  'SUCCESS',
  'REFUNDED'
] // TODO: Pull this out so it's being used everywhere else (Transaction icons etc.)

export const checkPendingSwaps = async ({ state, dispatch }, { walletId }) => {
  Object.keys(Networks).forEach(network => {
    const history = state.history[network]?.[walletId]
    if (!history) return
    history.forEach(order => {
      if (order.type !== 'SWAP') return
      if (order.error) return

      if (!COMPLETED_STATES.includes(order.status)) {
        dispatch('performNextAction', { network, walletId, id: order.id })
      }
    })
  })
}
