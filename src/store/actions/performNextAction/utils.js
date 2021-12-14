
import { random } from 'lodash-es'
import { unlockAsset } from '../../utils'

export async function withLock ({ dispatch }, { item, network, walletId, asset }, func) {
  const lock = await dispatch('getLockForAsset', { item, network, walletId, asset })
  try {
    return await func()
  } finally {
    unlockAsset(lock)
  }
}

export async function withInterval (func) {
  const updates = await func()
  if (updates) { return updates }
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const updates = await func()
      if (updates) {
        clearInterval(interval)
        resolve(updates)
      }
    }, random(15000, 30000))
  })
}
