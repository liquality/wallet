import { createNotification } from '../../broker/notification'
import { prettyBalance } from '../../utils/coinFormatter'

export const sendTransaction = async ({ commit, getters }, { network, walletId, asset, amount, to, from }) => {
  const client = getters.client(network, walletId, asset)

  const txHash = await client.chain.sendTransaction(to, amount, null, from)

  const transaction = {
    type: 'SEND',
    network,
    walletId,

    to: asset,
    from: asset,
    toAddress: to,
    fromAddress: from,

    amount,
    txHash,

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
    iconUrl: `./img/${asset.toLowerCase()}.png`
  })

  return txHash
}
