export const retrySwap = async ({ dispatch, commit }, { order }) => {
  commit('UPDATE_HISTORY', {
    network: order.network,
    walletId: order.walletId,
    id: order.id,
    updates: {
      error: false
    }
  })

  return dispatch('performNextAction', { network: order.network, walletId: order.walletId, id: order.id })
}
