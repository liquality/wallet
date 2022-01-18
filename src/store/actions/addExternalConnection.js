export const addExternalConnection = (
  { state, commit },
  { origin, chain, accountId, setDefaultEthereum }
) => {
  const { activeWalletId } = state
  commit('ADD_EXTERNAL_CONNECTION', { origin, activeWalletId, accountId, chain })
  if (setDefaultEthereum)
    commit('SET_EXTERNAL_CONNECTION_DEFAULT', { origin, activeWalletId, accountId })
}
