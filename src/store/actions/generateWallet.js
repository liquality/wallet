import { v4 as uuidv4 } from 'uuid'
import { generateMnemonic } from 'bip39'
import { encrypt } from '../../utils/crypto'

export const generateWallet = async ({ commit, state }, { name }) => {
  const id = uuidv4()
  const mnemonic = generateMnemonic()
  const at = Date.now()
  const newWallet = { id, name, mnemonic, at, imported: false }

  const encryptedWallets = encrypt(
    JSON.stringify([...state.wallets, newWallet]),
    state.key
  )

  commit('NEW_WALLET', { encryptedWallets, newWallet })

  return newWallet
}
