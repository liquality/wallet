export const forgetDappConnections = ({ commit, state }) => {
  const { activeWalletId } = state
  commit('REMOVE_EXTERNAL_CONNECTIONS', { activeWalletId })
}
