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

    status: 'SUCCESS'
  }

  commit('NEW_TRASACTION', {
    network,
    walletId,
    transaction
  })

  return txHash
}
