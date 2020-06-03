import { v4 as uuidv4 } from 'uuid'
import { generateMnemonic } from 'bip39'
import { encrypt } from '../../utils/crypto'

export const setupWallet = async ({ commit }, { key }) => {
  const id = uuidv4()
  const mnemonic = generateMnemonic()
  const at = Date.now()
  const name = 'Account 1'
  const wallet = { id, name, mnemonic, at, imported: false }

  const encryptedWallets = encrypt(
    JSON.stringify([wallet]),
    key
  )

  commit('SETUP_WALLET', { key, encryptedWallets, wallet })
  commit('CHANGE_ACTIVE_WALLETID', { walletId: id })

  return wallet
}
