import { attemptToLockAsset, waitForRandom, emitter } from '../utils'

export const getLockForAsset = async ({ dispatch, commit }, { network, walletId, asset, item }) => {
  const { key, success } = attemptToLockAsset(network, walletId, asset)

  if (!success) {
    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id: item.id,
      updates: {
        waitingForLock: true
      }
    })

    await new Promise(resolve => emitter.$once(`unlock:${key}`, () => resolve()))

    return dispatch('getLockForAsset', { network, walletId, asset, item })
  }

  commit('UPDATE_HISTORY', {
    network,
    walletId,
    id: item.id,
    updates: {
      waitingForLock: false
    }
  })

  await waitForRandom(3000, 5000)

  return key
}
