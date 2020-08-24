import { isObject } from 'lodash-es'
import { updateOrder, unlockAsset } from '../utils'

export const updateTransactionFee = async ({ dispatch, commit, getters }, { network, walletId, asset, id, hash, newFee }) => {
  const order = getters.historyItemById(network, walletId, id)

  const hashKey = Object.keys(order).find(key => order[key] === hash)
  const txKey = Object.keys(order).find(key => isObject(order[key]) && order[key].hash === hash)

  const client = getters.client(network, walletId, asset)

  const oldTx = order[txKey]

  let newTx
  const lock = await dispatch('getLockForAsset', { order, network, walletId, asset })
  try {
    newTx = await client.chain.updateTransactionFee(oldTx, newFee)
  } finally {
    unlockAsset(lock)
  }

  const updates = {
    [hashKey]: newTx.hash,
    [txKey]: newTx
  }

  commit('UPDATE_HISTORY', {
    network,
    walletId,
    id: id,
    updates
  })

  const isFundingUpdate = hashKey === 'fromFundHash'
  if (isFundingUpdate) {
    await updateOrder(order)
  }

  return newTx
}
