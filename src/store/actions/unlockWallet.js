import { decrypt } from '../../utils/crypto'

export const unlockWallet = async ({ commit, state }, { key }) => {
  const wallets = decrypt(state.encryptedWallets, key)
  if (!wallets) throw new Error('Invalid key')

  commit('UNLOCK_WALLET', {
    key,
    wallets: JSON.parse(wallets),
    unlockedAt: Date.now()
  })
}
