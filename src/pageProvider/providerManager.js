class InjectedProvider {
  constructor(asset) {
    this.asset = asset
  }

  setClient() {}

  getMethod(method) {
    return (...args) =>
      window.providerManager.proxy('CAL_REQUEST', {
        asset: this.asset,
        method,
        args
      })
  }
}

class ProviderManager {
  constructor() {
    this.cache = {}
  }

  proxy(type, data) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + '.' + Math.random()

      window.addEventListener(
        id,
        ({ detail }) => {
          const response = JSON.parse(detail)
          if (response.error) reject(new Error(response.error))
          else resolve(response.result)
        },
        {
          once: true,
          passive: true
        }
      )

      window.postMessage(
        {
          id,
          type,
          data
        },
        '*'
      )
    })
  }

  getProviderFor(asset) {
    if (this.cache[asset]) return this.cache[asset]

    this.cache[asset] = new InjectedProvider(asset)

    return this.cache[asset]
  }

  getInjectionName(chain) {
    return chain === 'ethereum' ? 'eth' : chain
  }

  enable(chain) {
    return this.proxy('ENABLE_REQUEST', { chain })
  }
}

export { InjectedProvider, ProviderManager }
