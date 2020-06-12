export const changeActiveNetwork = async ({ commit }, { network }) => {
  commit('CHANGE_ACTIVE_NETWORK', {
    network
  })
}
