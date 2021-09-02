export const changeActiveNetwork = async ({ commit }, {
  currentNetwork,
  network
}) => {
  commit('CHANGE_ACTIVE_NETWORK', {
    currentNetwork,
    network
  })
}
