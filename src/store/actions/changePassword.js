import { encrypt } from '../../utils/crypto'

export const changePassword = async ({ commit, state }, { key }) => {
  const encryptedWallets = encrypt(
    JSON.stringify(state.wallets),
    key
  )

  commit('CHANGE_PASSWORD', { key, encryptedWallets })
}
