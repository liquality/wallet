export const checkIfSwapHasExpired = async ({ commit, getters }, { network, walletId, order }) => {
  const client = getters.client(network, walletId, order.from)
  const latestBlock = await client.chain.getBlockByNumber(await client.chain.getBlockHeight())
  if (latestBlock.timestamp > order.swapExpiration) {
    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id: order.id,
      updates: {
        status: 'GET_REFUND'
      }
    })

    return true
  }

  return false
}
