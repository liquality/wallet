import { decrypt, decryptLegacy } from '../../utils/crypto'

export const unlockWallet = async ({ commit, state, dispatch }, { key }) => {
  let wallets = await decrypt(state.encryptedWallets, key, state.keySalt)

  // Migration to new encryption method
  // TODO: to be removed
  if (!wallets) {
    wallets = await decryptLegacy(state.encryptedWallets, key)
    if (wallets) await dispatch('changePassword', { key })
  }
  // Migration to new encryption method

  if (!wallets) throw new Error('Invalid key')

  commit('UNLOCK_WALLET', {
    key,
    wallets: JSON.parse(wallets),
    unlockedAt: Date.now()
  })
}
