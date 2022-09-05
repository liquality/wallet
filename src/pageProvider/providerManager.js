import { PageProvider } from './pageProvider'

class InjectedProvider extends PageProvider {
  constructor(window, asset) {
    super(window)
    this.asset = asset
  }

  setClient() {}

  getMethod(method) {
    return (...args) =>
      this.window.providerManager.proxy('CAL_REQUEST', {
        asset: this.asset,
        method,
        args
      })
  }
}

class ProviderManager extends PageProvider {
  constructor(window) {
    super(window)
    this.cache = {}
  }

  proxy(type, data) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + '.' + Math.random()

      this.window.addEventListener(
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

      this.window.postMessage(
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

    this.cache[asset] = new InjectedProvider(this.window, asset)

    return this.cache[asset]
  }

  getInjectionName(chain) {
    return chain === 'ethereum' ? 'eth' : chain
  }

  enable(chain) {
    return this.proxy('ENABLE_REQUEST', { chain })
  }

  setup() {
    this.window.providerManager = this
  }
}

export { InjectedProvider, ProviderManager }
