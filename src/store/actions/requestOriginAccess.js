import { stringify } from 'qs'

import { emitter } from '../utils'
import { createPopup } from '../../broker/utils'

export const requestOriginAccess = async ({ commit }, { origin }) => {
  return new Promise((resolve, reject) => {
    emitter.$once(`origin:${origin}`, allowed => {
      if (allowed) resolve(true)
      else reject(new Error('User denied'))
    })

    const query = stringify({ origin })

    createPopup(`/enable?${query}`)
  })
}
