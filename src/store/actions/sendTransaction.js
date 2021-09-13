import { v4 as uuidv4 } from 'uuid'
import { createHistoryNotification } from '../../broker/notification'
import BN from 'bignumber.js'

export const sendTransaction = async ({ dispatch, commit, getters }, {
  network,
  walletId,
  accountId,
  asset,
  to,
  amount,
  data,
  fee,
  gas,
  feeLabel,
  claimFeeLabel
}) => {
  const client = getters.client(
    {
      network,
      walletId,
      asset,
      accountId
    }
  )

  const originalEstimateGas = client._providers[0].estimateGas
  if (gas) {
    client._providers[0].estimateGas = async () => {
      return gas
    }
  }

  let tx
  try {
    tx = await client.chain.sendTransaction({ to, value: BN(amount), data, fee })
  } finally {
    client._providers[0].estimateGas = originalEstimateGas
  }

  const transaction = {
    id: uuidv4(),
    type: 'SEND',
    network,
    walletId,
    to: asset,
    from: asset,
    toAddress: to,
    amount: BN(amount).toNumber(),
    fee,
    tx,
    txHash: tx.hash,
    startTime: Date.now(),
    status: 'WAITING_FOR_CONFIRMATIONS',
    accountId
  }

  commit('NEW_TRASACTION', {
    network,
    walletId,
    accountId,
    transaction,
    feeLabel,
    claimFeeLabel
  })

  dispatch('performNextAction', { network, walletId, id: transaction.id, accountId })

  createHistoryNotification(transaction)

  return tx
}
