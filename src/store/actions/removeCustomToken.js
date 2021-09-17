export const removeCustomToken = async ({ commit }, { network, walletId, symbol }) => {
  const customToken = { symbol }
  commit('REMOVE_CUSTOM_TOKEN', { network, walletId, customToken })
}
