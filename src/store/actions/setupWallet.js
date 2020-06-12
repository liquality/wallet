export const setupWallet = async ({ commit }, { key }) => {
  commit('SETUP_WALLET', { key })
}
