import { performNextSwapAction } from './swap'
import { performNextTransactionAction } from './send'
import { createHistoryNotification } from '../../../broker/notification'

export const performNextAction = async (store, { network, walletId, id }) => {
  const { dispatch, commit, getters } = store
  const item = getters.historyItemById(network, walletId, id)
  if (!item) return
  if (!item.status) return

  let updates
  if (item.type === 'SWAP') {
    updates = await performNextSwapAction(store, { network, walletId, order: item })
  }
  if (item.type === 'SEND') {
    updates = await performNextTransactionAction(store, { network, walletId, transaction: item })
  }

  if (updates) {
    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    createHistoryNotification({
      ...item,
      ...updates
    })

    if (!updates.error) {
      dispatch('performNextAction', { network, walletId, id })
    }
  }
}
