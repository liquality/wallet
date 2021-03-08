import { v4 as uuidv4 } from 'uuid'
import { createHistoryNotification } from '../../broker/notification'

export const sendTransaction = async ({ dispatch, commit, getters }, { network, walletId, asset, to, amount, data, fee }) => {
  const client = getters.client(network, walletId, asset)
  const tx = await client.chain.sendTransaction(to, amount, data, fee)

  const transaction = {
    id: uuidv4(),
    type: 'SEND',
    network,
    walletId,
    to: asset,
    from: asset,
    toAddress: to,
    amount,
    fee,
    tx,
    txHash: tx.hash,
    startTime: Date.now(),
    status: 'WAITING_FOR_CONFIRMATIONS'
  }

  commit('NEW_TRASACTION', { network, walletId, transaction })

  dispatch('performNextAction', { network, walletId, id: transaction.id })

  createHistoryNotification(transaction)

  return tx
}
