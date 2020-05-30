import { inject } from './broker/utils'
import Script from './broker/Script'

const script = new Script()

window.addEventListener('message', event => {
  if (event.source !== window) return

  if (event.data.type && (event.data.type === 'CAL_REQUEST')) {
    const { id, asset, method, args } = event.data.payload

    script.proxy(asset)(method)(...args)
      .then(result => ({ result }))
      .catch(error => {
        console.error(error) /* eslint-disable-line */
        return { error: error.toString() }
      })
      .then(response => {
        window.dispatchEvent(new CustomEvent(id, { detail: response }))
      })
  }
}, false)

inject(`
class InjectedProvider {
  constructor (asset) {
    this.asset = asset
  }

  setClient () {}

  getMethod (method) {
    return (...args) => new Promise((resolve, reject) => {
      const id = Date.now() + '.' + Math.random()

      window.addEventListener(id, ({ detail }) => {
        if (detail.error) reject(new Error(detail.error))
        else resolve(detail.result)
      }, {
        once: true,
        passive: true
      })

      window.postMessage({
        type: 'CAL_REQUEST',
        payload: {
          id,
          asset: this.asset,
          method,
          args
        }
      }, '*')
    })
  }
}

class ProviderManager {
  constructor () {
    this.cache = {}
  }

  getProviderFor (asset) {
    if (this.cache[asset]) return this.cache[asset]

    this.cache[asset] = new InjectedProvider(asset)

    return this.cache[asset]
  }
}

window.providerManager = new ProviderManager()
`)
