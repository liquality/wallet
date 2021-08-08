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

  getInjectionName (chain) {
    return chain === 'ethereum' ? 'eth' : chain
  }

  enable (chain) {
    return this.proxy('ENABLE_REQUEST', { chain })
  }
}

window.providerManager = new ProviderManager()
`

const ethereumProvider = ({ asset, chain, network }) => `
const injectionName = window.providerManager.getInjectionName('${chain}')

async function getAddresses () {
  const eth = window.providerManager.getProviderFor('${asset}')
  let addresses = await eth.getMethod('wallet.getAddresses')()
  addresses = addresses.map(a => '0x' + a.address)
  window[injectionName].selectedAddress = addresses[0]
  return addresses
}

async function handleRequest (req) {
  const eth = window.providerManager.getProviderFor('${asset}')
  if(req.method.startsWith('metamask_')) return null

  if(req.method === 'eth_requestAccounts') {
    return await window[injectionName].enable()
  }
  if(req.method === 'personal_sign') { 
    const sig = await eth.getMethod('wallet.signMessage')(req.params[0], req.params[1])
    return '0x' + sig
  }
  if(req.method === 'eth_sendTransaction') {
    const to = req.params[0].to
    const value = req.params[0].value
    const data = req.params[0].data
    const gas = req.params[0].gas
    const result = await eth.getMethod('chain.sendTransaction')({ to, value, data, gas })
    return '0x' + result.hash
  }
  if(req.method === 'eth_accounts') {
    return getAddresses()
  }
  return eth.getMethod('jsonrpc')(req.method, ...req.params)
}

window[injectionName] = {
  isLiquality: true,
  isEIP1193: true,
  networkVersion: '${network.networkId}',
  chainId: '0x${network.chainId.toString(16)}',
  enable: async () => {
    const accepted = await window.providerManager.enable('${chain}')
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
      window[injectionName].sendAsync(req, _paramsOrCallback)
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
  on: (method, callback) => {
    if (method === 'chainChanged') {
      window.addEventListener('liqualityChainChanged', ({ detail }) => {
        const result = JSON.parse(detail)
        callback('0x' + result.chainIds['${chain}'].toString(16))
      })
    }
  },
  autoRefreshOnNetworkChange: false
}
`

const overrideEthereum = (chain) => `
function proxyEthereum(chain) {
  window.ethereumProxyChain = chain
  const overrideHandler = {
    get: function (target, prop, receiver) {
      if (prop === 'on') {
        return (method, callback) => {
          window.addEventListener('liqualityChainChanged', ({ detail }) => {
            const result = JSON.parse(detail)
            callback('0x' + result.chainIds[window.ethereumProxyChain].toString(16))
          })
          window.addEventListener('liqualityEthereumOverrideChanged', ({ detail }) => {
            const result = JSON.parse(detail)
            callback('0x' + result.chainIds[result.chain].toString(16))
          })
        }
      }
      return Reflect.get(...arguments)
    }
  }
  const injectionName = window.providerManager.getInjectionName(chain)
  window.ethereum = new Proxy(window[injectionName], overrideHandler)
}

function overrideEthereum(chain) {
  window.addEventListener('liqualityEthereumOverrideChanged', ({ detail }) => {
    const result = JSON.parse(detail)
    proxyEthereum(result.chain)
  })
  proxyEthereum(chain)
}

if (!window.ethereum) {
  overrideEthereum('${chain}')
  const retryLimit = 5
  let retries = 0
  const interval = setInterval(() => {
    retries++
    if (window.ethereum && !window.ethereum.isLiquality) {
      overrideEthereum('${chain}')
      clearInterval(interval)
    }
    if (retries >= retryLimit) clearInterval(interval)
  }, 1000)
} else {
  overrideEthereum('${chain}')
}
`

const bitcoinProvider = () => `
const REQUEST_MAP = {
  wallet_getConnectedNetwork: 'wallet.getConnectedNetwork',
  wallet_getAddresses: 'wallet.getAddresses',
  wallet_signMessage: 'wallet.signMessage',
  wallet_sendTransaction: 'chain.sendTransaction',
  wallet_signPSBT: 'signPSBT',
}

async function handleRequest (req) {
  const btc = window.providerManager.getProviderFor('BTC')
  if (req.method === 'wallet_sendTransaction') {
    const to = req.params[0].to
    const value = req.params[0].value.toString(16)
    return btc.getMethod('chain.sendTransaction')({ to, value })
  }
  const method = REQUEST_MAP[req.method] || req.method
  return btc.getMethod(method)(...req.params)
}

window.bitcoin = {
  enable: async () => {
    const accepted = await window.providerManager.enable('bitcoin')
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
  wallet_getConnectedNetwork: 'wallet.getConnectedNetwork',
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
    const accepted = await window.providerManager.enable('near')
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

const cosmosProvider = () => `
const REQUEST_MAP = {
  wallet_getConnectedNetwork: 'wallet.getConnectedNetwork',
  wallet_getAddresses: 'wallet.getAddresses',
  wallet_signMessage: 'wallet.signMessage',
  wallet_sendTransaction: 'chain.sendTransaction',
  wallet_signAmino: 'wallet.signAmino',
  wallet_sendInjectionTx: 'wallet.sendInjectionTx'
}
async function handleRequest (req) {
  const cosmos = window.providerManager.getProviderFor('PHOTON')
  const method = REQUEST_MAP[req.method] || req.method
  return cosmos.getMethod(method)(...req.params)
}
window.keplr = {
  address: null,
  async enable(chainId) {
    console.log('0')
    const accepted = await window.providerManager.enable('cosmos')
    if (!accepted) throw new Error('User rejected')
    const cosmos = window.providerManager.getProviderFor('PHOTON')
    const addr = await cosmos.getMethod('wallet.getAddresses')()
    console.log(chainId, addr)
    if(addr) {
      
      this.address = addr[0]

      const {address, publicKey} = this.address;
      console.log(address)
      return {
        name: 'kolev',
        algo: 'secp256k1',
        pubKey: new Uint8Array(publicKey.split(',')),
        address: new TextEncoder().encode(address),
        bech32Address: address
      }
    }
    
  },
  async getKey() {
    const accepted = await window.providerManager.enable('cosmos')
    if (!accepted) throw new Error('User rejected')
    const cosmos = window.providerManager.getProviderFor('PHOTON')
    const addr = await cosmos.getMethod('wallet.getAddresses')()
    
    const {address, publicKey} = addr[0];
    
    
    return {
      name: 'kolev',
      algo: 'secp256k1',
      pubKey: new Uint8Array(publicKey.split(',')),
      address: new TextEncoder().encode(address),
      bech32Address: address
    }
  },
  async request(req) {
    console.log('called2')
    const params = req.params || []
    return handleRequest({
      method: req.method, params
    })
  },
  async signAmino(
    chainId,
    signer,
    signDoc
  ) {
    const response = await this.request({
      method: REQUEST_MAP.wallet_signAmino,
      params: [signer, signDoc]
    })
    
    return response
  },
  async sendTx(
    chainId,
    stdTx,
    mode
  ) {
    console.log(stdTx)
    const response = await this.request({
      method: REQUEST_MAP.wallet_sendInjectionTx,
      params: [stdTx]
    })

    console.log('respa', response)
    
    return response
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
        await window.providerManager.enable('near')
        window.providerManager.proxy('HANDLE_PAYMENT_URI', { uri: href })
      }
    }
  })
}, { once: true })
`

export { providerManager, ethereumProvider, overrideEthereum, bitcoinProvider, nearProvider, cosmosProvider ,paymentUriHandler }
