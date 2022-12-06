import { stringify } from 'qs'
import { emitter } from '../../utils'
import { createPopup } from '../../../broker/utils'
import { NoActiveWalletError, WalletLockedError } from '@liquality/error-parser'

export const requestUnlockWallet = async ({ rootState }) => {
  if (!rootState.activeWalletId) throw new NoActiveWalletError()

  if (!rootState.unlockedAt) {
    const id = Date.now() + '.' + Math.random()
    return new Promise((resolve, reject) => {
      emitter.$once(`unlocked:${id}`, (unlocked) => {
        if (unlocked) resolve()
        else reject(new WalletLockedError())
      })
      const query = stringify({ id })

      createPopup(`/request-unlock?${query}`, () => reject(new WalletLockedError()))
    })
  }
}
