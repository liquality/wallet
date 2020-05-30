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
