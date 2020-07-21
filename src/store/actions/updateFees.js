export const updateFees = async ({ commit, getters, state }, { asset }) => {
  const network = state.activeNetwork
  const walletId = state.activeWalletId
  const fees = await getters.client(network, walletId, asset).chain.getFees()

  commit('UPDATE_FEES', { network, walletId, asset, fees })
}
