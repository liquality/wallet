function addEthereumChain({ chain, asset, network }) {
  const metamaskEmulated = ['opensea.io', 'unstoppabledomains.com'].some(
    (site) => window.location.host.indexOf(site) !== -1
  ) // Is some kind of smart emulation possible?

  const injectionName = window.providerManager.getInjectionName(chain)

  async function getAddresses() {
    const eth = window.providerManager.getProviderFor(asset)
    let addresses = await eth.getMethod('wallet.getAddresses')()
    addresses = addresses.map((a) => a.address)
    window[injectionName].selectedAddress = addresses[0]
    return addresses
  }

  async function ethereumHandleRequest(req) {
    const eth = window.providerManager.getProviderFor(asset)
    if (req.method.startsWith('metamask_')) return null

    if (req.method === 'eth_requestAccounts') {
      return await window[injectionName].enable(chain)
    }
    if (req.method === 'personal_sign') {
      const sig = await eth.getMethod('wallet.signMessage')(req.params[0], req.params[1])
      return '0x' + sig
    }

    if (
      req.method === 'eth_signTypedData' ||
      req.method === 'eth_signTypedData_v3' ||
      req.method === 'eth_signTypedData_v4'
    ) {
      const sig = await eth.getMethod('wallet.signTypedData')(req)
      return sig
    }

    if (req.method === 'eth_sendTransaction') {
      const to = req.params[0].to
      const value = req.params[0].value
      const data = req.params[0].data
      const gas = req.params[0].gas
      const result = await eth.getMethod('wallet.sendTransaction')({ to, value, data, gas })
      return result.hash
    }
    if (req.method === 'eth_accounts') {
      return getAddresses()
    }
    return eth.getMethod('chain.sendRpcRequest')(req.method, req.params)
  }

  window[injectionName] = {
    isLiquality: true,
    isMetaMask: metamaskEmulated,
    isEIP1193: true,
    networkVersion: network.networkId,
    chainId: network.chainId.toString(16),
    enable: async () => {
      const { accepted, _chain } = await window.providerManager.enable(chain)
      if (!accepted) throw new Error('User rejected')
      return getAddresses()
    },
    request: async (req) => {
      const params = req.params || []
      return ethereumHandleRequest({
        method: req.method,
        params
      })
    },
    send: async (req, _paramsOrCallback) => {
      if (typeof _paramsOrCallback === 'function') {
        window[injectionName].sendAsync(req, _paramsOrCallback)
        return
      }
      const method = typeof req === 'string' ? req : req.method
      const params = req.params || _paramsOrCallback || []
      return ethereumHandleRequest({ method, params }).then((result) => ({
        id: req && req.id ? req.id : 99999,
        jsonrpc: '2.0',
        result
      }))
    },
    removeAllListeners: (event) => {
      // mock this call for a hotfix
      return false
    },
    sendAsync: (req, callback) => {
      return ethereumHandleRequest(req)
        .then((result) =>
          callback(null, {
            id: req.id,
            jsonrpc: '2.0',
            result
          })
        )
        .catch((err) => callback(err))
    },
    on: (method, callback) => {
      if (method === 'chainChanged') {
        window.addEventListener('liqualityChainChanged', ({ detail }) => {
          const result = JSON.parse(detail)
          callback('0x' + result.chainIds[chain].toString(16))
        })
      }

      if (method === 'accountsChanged') {
        window.addEventListener('liqualityAccountsChanged', () => {
          const addresses = getAddresses()
          callback(addresses)
        })
      }
    },
    autoRefreshOnNetworkChange: false
  }
}

export { addEthereumChain }
