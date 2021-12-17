import { performNextTransactionAction } from './send'
import { createHistoryNotification } from '../../../broker/notification'

export const performNextAction = async (store, { network, walletId, id }) => {
  const { dispatch, commit, getters } = store
  const item = getters.historyItemById(network, walletId, id)
  if (!item) return
  if (!item.status) return

  let updates
  try {
    if (item.type === 'SWAP') {
      const swapProvider = store.getters.swapProvider(network, item.provider)
      updates = await swapProvider.performNextSwapAction(store, { network, walletId, swap: item })
    }
    if (item.type === 'SEND') {
      updates = await performNextTransactionAction(store, { network, walletId, transaction: item })
    }
  } catch (e) {
    updates = { error: e.toString() }
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

  return updates
}
