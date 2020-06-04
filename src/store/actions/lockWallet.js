export const lockWallet = async ({ commit }) => {
  commit('LOCK_WALLET', {
    key: null,
    wallets: [],
    unlockedAt: null
  })
}
