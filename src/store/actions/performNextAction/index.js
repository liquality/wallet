import { performNextTransactionAction } from './send'
import { createHistoryNotification } from '../../../broker/notification'
import { getSwapProtocol } from '../../../utils/swaps'

export const performNextAction = async (store, { network, walletId, id }) => {
  const { dispatch, commit, getters } = store
  const item = getters.historyItemById(network, walletId, id)
  if (!item) return
  if (!item.status) return

  let updates
  if (item.type === 'SWAP') {
    updates = await getSwapProtocol(network, item.protocol).performNextSwapAction(store, { network, walletId, swap: item })
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

  return updates
}
