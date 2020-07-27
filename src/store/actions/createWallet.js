import { v4 as uuidv4 } from 'uuid'
import { generateMnemonic } from 'bip39'
import { encrypt } from '../../utils/crypto'

export const createWallet = async ({ commit }, { key, mnemonic }) => {
  const id = uuidv4()
  const walletMnemonic = mnemonic || generateMnemonic()
  const at = Date.now()
  const name = 'Account 1'
  const wallet = { id, name, mnemonic: walletMnemonic, at, imported: false }

  const { encrypted: encryptedWallets, keySalt } = await encrypt(
    JSON.stringify([wallet]),
    key
  )

  commit('CREATE_WALLET', { keySalt, encryptedWallets, wallet })
  commit('CHANGE_ACTIVE_WALLETID', { walletId: id })

  return wallet
}
