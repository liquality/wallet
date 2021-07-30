import { encrypt, decrypt, decryptLegacy } from '../../utils/crypto'

export const unlockWallet = async ({ commit, state, dispatch }, { key }) => {
  let wallets = await decrypt(state.encryptedWallets, key, state.keySalt)

  const accKeys = Object.keys(state.accounts);
  const accData = state.accounts[accKeys].mainnet;
  const rskBalances = accData.filter(e => e.chain === 'rsk')[0].balances
  const hasBalance = Object.values(rskBalances).some(balance => balance > 0)

  // Migration to new encryption method
  // TODO: to be removed
  if (!wallets) {
    wallets = await decryptLegacy(state.encryptedWallets, key)
    if (wallets) {
      const { encrypted: encryptedWallets, keySalt } = await encrypt(wallets, key)
      commit('CREATE_WALLET', { keySalt, encryptedWallets, wallet: JSON.parse(wallets)[0], rskLegacyDerivation: !hasBalance })
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
    rskLegacyDerivation: !hasBalance
  })
}
