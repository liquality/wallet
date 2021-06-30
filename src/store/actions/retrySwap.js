export const retrySwap = async ({ dispatch, commit }, { swap }) => {
  commit('UPDATE_HISTORY', {
    network: swap.network,
    walletId: swap.walletId,
    id: swap.id,
    updates: {
      error: false
    }
  })

  return dispatch('performNextAction', { network: swap.network, walletId: swap.walletId, id: swap.id })
}
