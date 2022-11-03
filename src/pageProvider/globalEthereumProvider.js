import { UserDeclinedError } from '@liquality/error-parser'
import { PageProvider } from './pageProvider'

class GlobalEthereumPageProvider extends PageProvider {
  override
  ethereumChain
  constructor(window, override, ethereumChain) {
    super(window)
    this.override = override
    this.ethereumChain = ethereumChain
  }

  async enable() {
    // TODO: explicityl pass provider maanger?
    const { accepted, chain } = await this.window.providerManager.enable()
    if (!accepted) throw new UserDeclinedError()
    const chainChanged = this.window.ethereumProxyChain !== chain
    this.window.ethereumProxyChain = chain
    const injectionName = this.window.providerManager.getInjectionName(chain)
    if (chainChanged) {
      this.window.dispatchEvent(
        new CustomEvent('liqualityChainChanged', {
          detail: JSON.stringify({ chainIds: { [chain]: this.window[injectionName].chainId } })
        })
      )
    }
    return this.window[injectionName].enable(chain)
  }

  proxyEthereum() {
    this.window.ethereumProxyChain = this.ethereumChain

    const overrideHandler = {
      get: (_target, prop) => {
        const injectionName = this.window.providerManager.getInjectionName(
          this.window.ethereumProxyChain
        )
        const target = window[injectionName]

        if (prop === 'on') {
          return (method, callback) => {
            if (method === 'chainChanged') {
              this.window.addEventListener('liqualityChainChanged', ({ detail }) => {
                const result = JSON.parse(detail)
                callback('0x' + result.chainIds[this.window.ethereumProxyChain].toString(16))
              })
            }

            if (method === 'accountsChanged') {
              this.window.addEventListener('liqualityAccountsChanged', () => {
                target.request({ method: 'eth_accounts', params: [] }).then((newAccounts) => {
                  callback(newAccounts)
                })
              })
            }
          }
        }

        if (prop === 'enable') {
          return async () => {
            return this.enable()
          }
        }

        if (prop === 'request') {
          return async (req) => {
            if (req.method === 'eth_requestAccounts') {
              return this.enable()
            }
            return target[prop](req)
          }
        }

        if (prop === 'send') {
          return async (req, _paramsOrCallback) => {
            const method = typeof req === 'string' ? req : req.method
            if (method === 'eth_requestAccounts') {
              if (typeof _paramsOrCallback === 'function') {
                const callback = _paramsOrCallback
                return this.enable()
                  .then((result) =>
                    callback(null, {
                      id: req.id,
                      jsonrpc: '2.0',
                      result
                    })
                  )
                  .catch((err) => callback(err))
              }
              return this.enable()
            }
            return target[prop](req, _paramsOrCallback)
          }
        }

        return target[prop]
      }
    }
    this.window.ethereum = new Proxy({}, overrideHandler)
  }

  setup() {
    if (this.override) {
      this.proxyEthereum()
      const retryLimit = 5
      let retries = 0
      const interval = setInterval(() => {
        retries++
        if (this.window.ethereum && !this.window.ethereum.isLiquality) {
          this.proxyEthereum()
          clearInterval(interval)
        }
        if (retries >= retryLimit) clearInterval(interval)
      }, 1000)
    } else if (!this.window.ethereum) {
      this.proxyEthereum()
    }
  }
}

export { GlobalEthereumPageProvider }
