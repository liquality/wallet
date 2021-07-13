import { stringify } from 'qs'
import { emitter } from '../utils'
import { createPopup } from '../../broker/utils'

export const requestOriginAccess = async ({ state, dispatch, commit }, { origin, accountId }) => {
  await dispatch('requestUnlockWallet')

  return new Promise((resolve, reject) => {
    emitter.$once(`origin:${origin}`, allowed => {
      if (allowed) {
        const { activeWalletId } = state
        commit('ADD_EXTERNAL_CONNECTION', { origin, activeWalletId, accountId })
        resolve(true)
      } else {
        reject(new Error('User denied'))
      }
    })

    const query = stringify({ origin })

    createPopup(`/enable?${query}`)
  })
}
