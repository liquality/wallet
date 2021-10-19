export const toggleAccount = ({ commit, dispatch }, { network, walletId, accounts, enable }) => {
  accounts.forEach(accountId => {
    commit('TOGGLE_ACCOUNT', { network, walletId, accountId, enable })
    if (enable) {
      dispatch('updateAccountBalance', {
        network,
        walletId,
        accountId
      })
    }
  })
}
