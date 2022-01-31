import { performNextTransactionAction } from './send'
import { createHistoryNotification } from '../../../broker/notification'

export const performNextAction = async (store, { network, walletId, id }) => {
  console.log(' 1 ----- ')

  console.log('performNextAction: ', store, { network, walletId, id })
  const { dispatch, commit, getters } = store
  // console.log('performNextAction: ', dispatch, commit, getters)
  const item = getters.historyItemById(network, walletId, id)
  console.log('performNextAction: item: ', item)
  if (!item) return
  if (!item.status) return

  console.log(' 2 ----- ')

  let updates
  try {
    if (item.type === 'SWAP') {
      console.log(' 3 ----- ')
      const swapProvider = store.getters.swapProvider(network, item.provider)
      updates = await swapProvider.performNextSwapAction(store, {
        network,
        walletId,
        swap: item
      })
      console.log(' 4 ----- ')
    }
    if (item.type === 'SEND') {
      updates = await performNextTransactionAction(store, {
        network,
        walletId,
        transaction: item
      })
    }
  } catch (e) {
    updates = { error: e.toString() }
  }

  console.log('performNextAction updates: ', updates)

  console.log(' 5 ----- ')
  if (updates) {
    console.log(' 6 ----- ')
    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    console.log(' 7 ----- ')

    createHistoryNotification({
      ...item,
      ...updates
    })

    console.log(' 8 ----- ')
    if (!updates.error) {
      dispatch('performNextAction', { network, walletId, id })
    }
  }

  console.log(' 9 ----- ')

  return updates
}
