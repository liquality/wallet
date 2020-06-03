import { emitter } from '../utils'

export const requestOriginAccess = async ({ commit }, { origin }) => {
  return new Promise((resolve, reject) => {
    emitter.$once(`origin:${origin}`, allowed => {
      if (allowed) resolve(true)
      else reject(new Error('User denied'))
    })

    browser.windows.create({
      url: `./index.html#/enable/${origin}`,
      focused: true,
      type: 'popup',
      height: 600,
      width: 360
    })
  })
}
