import { stringify } from 'qs'
import { emitter } from '../utils'
import { createPopup } from '../../broker/utils'

export const requestOriginAccess = async ({ state, dispatch, commit }, { origin, chain, setDefault }) => {
  const { requestOriginAccessActive } = state.app

  if (!requestOriginAccessActive) {
    commit('app/SET_ORIGIN_ACCESS_ACTIVE', { active: true }, { root: true })
    try {
      await dispatch('requestUnlockWallet')
    } catch (e) {
      commit('app/SET_ORIGIN_ACCESS_ACTIVE', { active: false }, { root: true })
      throw e
    }

    return new Promise((resolve, reject) => {
      emitter.$once(`origin:${origin}`, (allowed, accountId, chain) => {
        commit('app/SET_ORIGIN_ACCESS_ACTIVE', { active: false }, { root: true })
        if (allowed) {
          const { activeWalletId } = state

          commit('ADD_EXTERNAL_CONNECTION', { origin, activeWalletId, accountId, chain })
          if (setDefault) commit('SET_EXTERNAL_CONNECTION_DEFAULT', { origin, activeWalletId, accountId })

          resolve({
            accepted: true,
            chain
          })
        } else {
          reject(new Error('User denied'))
        }
      })

      const query = stringify({ origin, chain })
      createPopup(`/enable?${query}`, () => {
        commit('app/SET_ORIGIN_ACCESS_ACTIVE', { active: false }, { root: true })
        reject(new Error('User denied'))
      })
    })
  }
}
