import { v4 as uuidv4 } from 'uuid'
import { createHistoryNotification } from '../../broker/notification'
import BN from 'bignumber.js'

export const sendTransaction = async ({ dispatch, commit, getters }, { network, walletId, accountId, asset, to, amount, data, fee }) => {
  const account = getters.accountItem(accountId)
  const client = getters.client(network, walletId, asset, account?.type)
  const tx = await client.chain.sendTransaction({ to, value: BN(amount), data, fee })

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

  commit('NEW_TRASACTION', { network, walletId, accountId, transaction })

  dispatch('performNextAction', { network, walletId, id: transaction.id, accountId })

  createHistoryNotification(transaction)

  return tx
}
