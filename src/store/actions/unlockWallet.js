import { encrypt, decrypt, decryptLegacy } from '../../utils/crypto'
import { getLegacyRskBalance } from '../utils'

export const unlockWallet = async ({ commit, state, dispatch }, { key }) => {
  let wallets = await decrypt(state.encryptedWallets, key, state.keySalt)

  const balance = await getLegacyRskBalance(state.accounts)
  // Migration to new encryption method
  // TODO: to be removed
  if (!wallets) {
    wallets = await decryptLegacy(state.encryptedWallets, key)
    if (wallets) {
      const { encrypted: encryptedWallets, keySalt } = await encrypt(wallets, key)
      commit('CREATE_WALLET', { keySalt, encryptedWallets, wallet: JSON.parse(wallets)[0], rskLegacyDerivation: !balance.toNumber() })
    }
  }
  // Migration to new encryption method

  if (!wallets) {
    throw new Error(
      'Try Again. Enter the right password (it has 8 or more characters).'
    )
  }

  commit('UNLOCK_WALLET', {
    key,
    wallets: JSON.parse(wallets),
    unlockedAt: Date.now(),
    rskLegacyDerivation: !balance.toNumber()
  })
}
