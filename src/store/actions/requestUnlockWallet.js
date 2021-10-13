
import { stringify } from 'qs'
import { emitter } from '../utils'
import { createPopup } from '../../broker/utils'

export const requestUnlockWallet = async ({ state, commit }) => {
  if (!state.activeWalletId) throw new Error('No active wallet found. Create a wallet first.')

  if (!state.unlockedAt) {
    const id = Date.now() + '.' + Math.random()
    return new Promise((resolve, reject) => {
      emitter.$once(`unlocked:${id}`, unlocked => {
        if (unlocked) resolve()
        else reject(new Error('Wallet is locked. Unlock the wallet first.'))
      })
      const query = stringify({ id })

      createPopup(`/request-unlock?${query}`, () => reject(new Error('Wallet is locked. Unlock the wallet first.')))
    })
  }
}
