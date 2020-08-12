import { NetworkAssets } from '../factory/client'

const COMPLETED_STATES = [
  'SUCCESS',
  'REFUNDED'
] // TODO: Pull this out so it's being used everywhere else (Transaction icons etc.)

export const checkPendingSwaps = async ({ state, dispatch }) => {
  Object.keys(NetworkAssets).forEach(network => {
    if (!state.history[network]) return

    Object.keys(state.history[network]).forEach(walletId => {
      state.history[network][walletId].forEach(order => {
        if (order.type !== 'SWAP') return

        if (!COMPLETED_STATES.includes(order.status)) {
          dispatch('performNextAction', { network, walletId, id: order.id })
        }
      })
    })
  })
}
