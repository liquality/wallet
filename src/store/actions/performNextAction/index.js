import { performNextSwapAction } from './swap'
import { performNextTransactionAction } from './send'
import { createHistoryNotification } from '../../../broker/notification'

export const performNextAction = async (store, { network, walletId, accountId, id }) => {
  const { dispatch, commit, getters } = store
  const item = getters.historyItemById(network, walletId, id)
  if (!item) return
  if (!item.status) return

  let updates
  if (item.type === 'SWAP') {
    updates = await performNextSwapAction(store, { network, walletId, accountId, order: item })
  }
  if (item.type === 'SEND') {
    updates = await performNextTransactionAction(store, { network, walletId, accountId, transaction: item })
  }

  if (updates) {
    commit('UPDATE_HISTORY', {
      network,
      walletId,
      accountId,
      id,
      updates
    })

    createHistoryNotification({
      ...item,
      ...updates
    })

    if (!updates.error) {
      dispatch('performNextAction', { network, walletId, accountId, id })
    }
  }
}
