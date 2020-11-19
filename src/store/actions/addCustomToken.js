export const addCustomToken = async ({ commit }, { network, walletId, symbol, name, contractAddress, decimals }) => {
  const customToken = { symbol, name, contractAddress, decimals }
  commit('ADD_CUSTOM_TOKEN', { network, walletId, customToken })
}
