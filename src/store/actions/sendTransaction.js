import { createNotification } from '../../broker/notification'
import { prettyBalance } from '../../utils/coinFormatter'
import { getAssetIcon } from '../../utils/asset'

export const sendTransaction = async ({ commit, getters }, { network, walletId, asset, to, amount, data, fee }) => {
  const client = getters.client(network, walletId, asset)

  const tx = await client.chain.sendTransaction(to, amount, data, fee)

  const transaction = {
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
    status: 'SUCCESS'
  }

  commit('NEW_TRASACTION', {
    network,
    walletId,
    transaction
  })

  createNotification({
    title: `New ${asset} Transaction`,
    message: `Sent ${prettyBalance(amount, asset)} ${asset} to ${to}`,
    iconUrl: getAssetIcon(asset)
  })

  return tx
}
