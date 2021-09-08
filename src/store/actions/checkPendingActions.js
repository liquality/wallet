import { Networks } from '@/utils/networks'

const COMPLETED_STATES = [
  'SUCCESS',
  'REFUNDED'
] // TODO: Pull this out so it's being used everywhere else (Transaction icons etc.)

export const checkPendingActions = async ({ state, dispatch }, { walletId }) => {
  Networks.forEach(network => {
    const history = state.history[network]?.[walletId]
    if (!history) return
    history.forEach(item => {
      if (item.error) return

      if (!COMPLETED_STATES.includes(item.status)) {
        dispatch('performNextAction', { network, walletId, id: item.id })
      }
    })
  })
}
