
import { withInterval } from './utils'
import { TxStatus } from '@liquality/types'

async function waitForConfirmations ({ getters, dispatch }, { transaction, network, walletId }) {
  const client = getters.client(
    {
      network,
      walletId,
      asset: transaction.from,
      accountId: transaction.accountId
    }
  )
  try {
    const tx = await client.chain.getTransactionByHash(transaction.txHash)

    // In case transaction doesn't exist: wait for 30 minutes then return failed state
    // Could happen on Dropped&Replaced
    if (!tx && Date.now() - transaction.startTime > 1800000) {
      return {
        endTime: Date.now(),
        status: TxStatus.Failed
      }
    }

    // In case transaction exists and has more than 0 confirmations: return tx state
    if (tx && tx.confirmations > 0) {
      dispatch('updateBalances', { network, walletId, assets: [transaction.from] })

      return {
        endTime: Date.now(),
        status: 'SUCCESS'
      }
    }
  } catch (e) {
    if (e.name === 'TxNotFoundError') console.warn(e)
    else throw e
  }
}

export const performNextTransactionAction = async (store, { network, walletId, transaction }) => {
  let updates

  if (transaction.status === 'WAITING_FOR_CONFIRMATIONS') {
    updates = await withInterval(async () => waitForConfirmations(store, { transaction, network, walletId }))
  }

  return updates
}
