import { v4 as uuidv4 } from 'uuid'
import { encrypt } from '../../utils/crypto'

export const importWallet = async ({ commit, state }, { name, mnemonic }) => {
  const id = uuidv4()
  const at = Date.now()
  const newWallet = { id, name, mnemonic, at, imported: true }

  const encryptedWallets = encrypt(
    JSON.stringify([...state.wallets, newWallet]),
    state.key
  )

  commit('NEW_WALLET', { encryptedWallets, newWallet })

  return newWallet
}
