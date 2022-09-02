function proxyEthereum(chain) {
  window.ethereumProxyChain = chain

  const enable = async () => {
    const { accepted, chain } = await window.providerManager.enable()
    if (!accepted) throw new Error('User rejected')
    const chainChanged = window.ethereumProxyChain !== chain
    window.ethereumProxyChain = chain
    const injectionName = window.providerManager.getInjectionName(chain)
    if (chainChanged) {
      window.dispatchEvent(
        new CustomEvent('liqualityChainChanged', {
          detail: JSON.stringify({ chainIds: { [chain]: window[injectionName].chainId } })
        })
      )
    }
    return window[injectionName].enable(chain)
  }

  const overrideHandler = {
    get: function (_target, prop) {
      const injectionName = window.providerManager.getInjectionName(window.ethereumProxyChain)
      const target = window[injectionName]

      if (prop === 'on') {
        return (method, callback) => {
          if (method === 'chainChanged') {
            window.addEventListener('liqualityChainChanged', ({ detail }) => {
              const result = JSON.parse(detail)
              callback('0x' + result.chainIds[window.ethereumProxyChain].toString(16))
            })
          }

          if (method === 'accountsChanged') {
            window.addEventListener('liqualityAccountsChanged', () => {
              target.request({ method: 'eth_accounts', params: [] }).then((newAccounts) => {
                callback(newAccounts)
              })
            })
          }
        }
      }

      if (prop === 'enable') {
        return async () => {
          return enable()
        }
      }

      if (prop === 'request') {
        return async (req) => {
          if (req.method === 'eth_requestAccounts') {
            return enable()
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
              return enable()
                .then((result) =>
                  callback(null, {
                    id: req.id,
                    jsonrpc: '2.0',
                    result
                  })
                )
                .catch((err) => callback(err))
            }
            return enable()
          }
          return target[prop](req, _paramsOrCallback)
        }
      }

      if (prop === 'sendAsync') {
        // return async (req, _paramsOrCallback) => {
        //   window.req = req
        //   // if(req.method === 'wallet_switchEthereumChain') {
        //   //   const { params } = req
        //   //   const { chainId } = params[0]
        //   //   if(chainId === "0x89") {
        //   //     const callback = _paramsOrCallback
        //   //     await window.providerManager.enable('polygon', true)
        //   //     return callback(null, {
        //   //       id: req.id,
        //   //       jsonrpc: '2.0',
        //   //       result: null
        //   //     })
        //   //   }
        //   //}
        //   return target[prop](req, _paramsOrCallback)
        // }
      }

      return target[prop]
    }
  }
  window.ethereum = new Proxy({}, overrideHandler)
}

function addGlobalEthereumProvider() {
  const { override, ethereumChain } = window.liquality.globalEthereum

  if (override) {
    proxyEthereum(ethereumChain)
    const retryLimit = 5
    let retries = 0
    const interval = setInterval(() => {
      retries++
      if (window.ethereum && !window.ethereum.isLiquality) {
        proxyEthereum(ethereumChain)
        clearInterval(interval)
      }
      if (retries >= retryLimit) clearInterval(interval)
    }, 1000)
  } else if (!window.ethereum) {
    proxyEthereum(ethereumChain)
  }
}

export { addGlobalEthereumProvider }
