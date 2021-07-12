export const addCustomToken = async ({ commit }, { network, walletId, chain, symbol, name, contractAddress, decimals }) => {
  const customToken = { symbol, name, contractAddress, decimals, chain: chain }
  commit('ADD_CUSTOM_TOKEN', { network, walletId, customToken })
}
