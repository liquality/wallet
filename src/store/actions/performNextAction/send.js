
import { withInterval } from './utils'

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
