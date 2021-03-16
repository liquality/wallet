const providerManager = () => `
class InjectedProvider {
  constructor (asset) {
    this.asset = asset
  }

  setClient () {}

  getMethod (method) {
    return (...args) => window.providerManager.proxy('CAL_REQUEST', {
      asset: this.asset,
      method,
      args
    })
  }
}

class ProviderManager {
  constructor () {
    this.cache = {}
  }

  proxy (type, data) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + '.' + Math.random()
  
      window.addEventListener(id, ({ detail }) => {
        const response = JSON.parse(detail)
        if (response.error) reject(new Error(response.error))
        else resolve(response.result)
      }, {
        once: true,
        passive: true
      })
  
      window.postMessage({
        id,
        type,
        data
      }, '*')
    })
  }

  getProviderFor (asset) {
    if (this.cache[asset]) return this.cache[asset]

    this.cache[asset] = new InjectedProvider(asset)

    return this.cache[asset]
  }

  enable () {
    return this.proxy('ENABLE_REQUEST')
  }
}

window.providerManager = new ProviderManager()
`

const ethereumProvider = ({ asset, networkVersion, chainId }) => `
async function getAddresses () {
  const eth = window.providerManager.getProviderFor('${asset}')
  let addresses = await eth.getMethod('wallet.getAddresses')()
  addresses = addresses.map(a => '0x' + a.address)
  return addresses
}

async function handleRequest (req) {
  const eth = window.providerManager.getProviderFor('${asset}')
  if(req.method.startsWith('metamask_')) return null

  if(req.method === 'eth_requestAccounts') {
    return await window.ethereum.enable()
  }
  if(req.method === 'personal_sign') { 
    const sig = await eth.getMethod('wallet.signMessage')(req.params[0], req.params[1])
    return '0x' + sig
  }
  if(req.method === 'eth_sendTransaction') {
    const result = await eth.getMethod('chain.sendTransaction')(req.params[0].to, parseInt(req.params[0].value, 16), req.params[0].data)
    return '0x' + result.hash
  }
  if(req.method === 'eth_accounts') {
    return getAddresses()
  }
  return eth.getMethod('jsonrpc')(req.method, ...req.params)
}

window.liqualityEthereum = {
  isLiquality: true,
  isEIP1193: true,
  networkVersion: '${networkVersion}',
  chainId: '${chainId}',
  enable: async () => {
    const accepted = await window.providerManager.enable()
    if (!accepted) throw new Error('User rejected')
    return getAddresses()
  },
  request: async (req) => {
    const params = req.params || []
    return handleRequest({
      method: req.method, params
    })
  },
  send: async (req, _paramsOrCallback) => {
    if (typeof _paramsOrCallback === 'function') {
      window.ethereum.sendAsync(req, _paramsOrCallback)
      return
    }
    const method = typeof req === 'string' ? req : req.method
    const params = req.params || _paramsOrCallback || []
    return handleRequest({ method, params })
  },
  sendAsync: (req, callback) => {
    handleRequest(req)
      .then((result) => callback(null, {
        id: req.id,
        jsonrpc: '2.0',
        result
      }))
      .catch((err) => callback(err))
  },
  on: (method, callback) => {}, // TODO
  autoRefreshOnNetworkChange: false
}

function override() {
  window.ethereum = window.liqualityEthereum
}

if (!window.ethereum) {
  override()
  const retryLimit = 5
  let retries = 0
  const interval = setInterval(() => {
    retries++
    if (window.ethereum && !window.ethereum.isLiquality) {
      override()
      clearInterval(interval)
    }
    if (retries >= retryLimit) clearInterval(interval)
  }, 1000)
} else {
  override()
}
`

const bitcoinProvider = () => `
const REQUEST_MAP = {
  wallet_getConnectedNetwork: 'chain.getConnectedNetwork',
  wallet_getAddresses: 'wallet.getAddresses',
  wallet_signMessage: 'wallet.signMessage',
  wallet_sendTransaction: 'chain.sendTransaction',
  wallet_signPSBT: 'signPSBT',
}

async function handleRequest (req) {
  const btc = window.providerManager.getProviderFor('BTC')
  const method = REQUEST_MAP[req.method] || req.method
  return btc.getMethod(method)(...req.params)
}

window.bitcoin = {
  enable: async () => {
    const accepted = await window.providerManager.enable()
    if (!accepted) throw new Error('User rejected')
    const btc = window.providerManager.getProviderFor('BTC')
    return btc.getMethod('wallet.getAddresses')()
  },
  request: async (req) => {
    const params = req.params || []
    return handleRequest({
      method: req.method, params
    })
  }
}
`

const nearProvider = () => `
const REQUEST_MAP = {
  wallet_getConnectedNetwork: 'chain.getConnectedNetwork',
  wallet_getAddresses: 'wallet.getAddresses',
  wallet_signMessage: 'wallet.signMessage',
  wallet_sendTransaction: 'chain.sendTransaction',
}

async function handleRequest (req) {
  const near = window.providerManager.getProviderFor('NEAR')
  const method = REQUEST_MAP[req.method] || req.method
  return near.getMethod(method)(...req.params)
}

window.near = {
  enable: async () => {
    const accepted = await window.providerManager.enable()
    if (!accepted) throw new Error('User rejected')
    const near = window.providerManager.getProviderFor('NEAR')
    return near.getMethod('wallet.getAddresses')()
  },
  request: async (req) => {
    const params = req.params || []
    return handleRequest({
      method: req.method, params
    })
  }
}
`

const paymentUriHandler = () => `
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', async (e) => {
    const element = e.target
    if (!element || !element.closest) return
    const uri = element.closest('[href^="bitcoin:"]') || element.closest('[href^="ethereum:"]')
    if (uri) {
      const href = uri.getAttribute('href')
      const includesAmount = href.includes('value=') || href.includes('amount=')
      if (includesAmount) {
        e.preventDefault()
        await window.providerManager.enable()
        window.providerManager.proxy('HANDLE_PAYMENT_URI', { uri: href })
      }
    }
  })
}, { once: true })
`

export { providerManager, ethereumProvider, bitcoinProvider, nearProvider, paymentUriHandler }
