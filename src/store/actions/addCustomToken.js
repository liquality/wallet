export const addCustomToken = async ({ commit }, { network, walletId, erc20Network, symbol, name, contractAddress, decimals }) => {
  const customToken = { symbol, name, contractAddress, decimals, network: erc20Network }
  commit('ADD_CUSTOM_TOKEN', { network, walletId, customToken })
}
