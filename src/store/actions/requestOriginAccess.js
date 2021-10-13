import { stringify } from 'qs'
import { emitter } from '../utils'
import { createPopup } from '../../broker/utils'

export const requestOriginAccess = async ({ state, dispatch, commit }, { origin, chain }) => {
  const { requestOriginAccessActive } = state.app

  if (!requestOriginAccessActive) {
    commit('app/SET_ORIGIN_ACCESS_ACTIVE', { active: true }, { root: true })
    await dispatch('requestUnlockWallet')

    return new Promise((resolve, reject) => {
      emitter.$once(`origin:${origin}`, (allowed, accountId, chain) => {
        commit('app/SET_ORIGIN_ACCESS_ACTIVE', { active: false }, { root: true })
        if (allowed) {
          const { activeWalletId } = state
          commit('ADD_EXTERNAL_CONNECTION', { origin, activeWalletId, accountId, chain })
          resolve(true)
        } else {
          reject(new Error('User denied'))
        }
      })

      const query = stringify({ origin, chain })
      createPopup(`/enable?${query}`)
    })
  }
}
