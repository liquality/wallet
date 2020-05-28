import { attemptToLockAsset, waitForRandom, emitter } from '../utils'

export const getLockForAsset = async ({ dispatch, commit }, { network, walletId, asset, order }) => {
  const result = attemptToLockAsset(network, walletId, asset)

  if (result !== true) {
    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id: order.id,
      updates: {
        waitingForLock: true
      }
    })

    await new Promise(resolve => emitter.$once(`unlock:${result}`, () => resolve()))

    await dispatch('getLockForAsset', { network, walletId, asset, order })
  } else {
    if (order.waitingForLock) {
      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id: order.id,
        updates: {
          waitingForLock: false
        }
      })
    }

    await waitForRandom(3000, 5000)
  }
}
