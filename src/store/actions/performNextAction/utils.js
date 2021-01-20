
import { random } from 'lodash-es'
import { unlockAsset, wait } from '../../utils'

export async function withLock ({ dispatch }, { item, network, walletId, asset }, func) {
  const lock = await dispatch('getLockForAsset', { item, network, walletId, asset })
  try {
    return await func()
  } catch (e) {
    return { error: e.toString() }
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

export async function hasChainTimePassed ({ getters }, { network, walletId, asset, timestamp }) {
  const client = getters.client(network, walletId, asset)
  const maxTries = 3
  let tries = 0
  while (tries < maxTries) {
    try {
      const blockNumber = await client.chain.getBlockHeight()
      const latestBlock = await client.chain.getBlockByNumber(blockNumber)
      return latestBlock.timestamp > timestamp
    } catch (e) {
      tries++
      if (tries >= maxTries) throw e
      else {
        console.warn(e)
        await wait(2000)
      }
    }
  }
}
