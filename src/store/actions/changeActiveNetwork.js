export const changeActiveNetwork = async ({ state, commit }, { network }) => {
  const { activeNetwork } = state
  commit('CHANGE_ACTIVE_NETWORK', {
    currentNetwork: activeNetwork,
    network
  })
}
