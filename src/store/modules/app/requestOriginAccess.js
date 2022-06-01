import { stringify } from 'qs'
import { emitter } from '../../utils'
import { createPopup } from '../../../broker/utils'

export const requestOriginAccess = async (
  { state, dispatch, commit },
  { origin, chain, setDefaultEthereum, reselect }
) => {
  const { requestOriginAccessActive } = state

  if (!requestOriginAccessActive) {
    commit('SET_ORIGIN_ACCESS_ACTIVE', { active: true })
    try {
      await dispatch('requestUnlockWallet')
    } catch (e) {
      commit('SET_ORIGIN_ACCESS_ACTIVE', { active: false })
      throw e
    }

    return new Promise((resolve, reject) => {
      emitter.$once(`origin:${origin}`, (allowed, accountId, chain) => {
        commit('SET_ORIGIN_ACCESS_ACTIVE', { active: false })

        if (allowed) {
          dispatch(
            'addExternalConnection',
            { origin, accountId, chain, setDefaultEthereum },
            { root: true }
          )
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

        commit('SET_ORIGIN_ACCESS_ACTIVE', { active: false })
        reject(new Error('User denied'))
      })
    })
  }
}
