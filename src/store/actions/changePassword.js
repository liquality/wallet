import { encrypt } from '../../utils/crypto'

export const changePassword = async ({ commit, state }, { key }) => {
  const { encrypted: encryptedWallets, keySalt } = await encrypt(
    JSON.stringify(state.wallets),
    key
  )

  commit('CHANGE_PASSWORD', { key, keySalt, encryptedWallets })
}
