const providerManager = () => `
class InjectedProvider {
  constructor (asset) {
    this.asset = asset
  }

  setClient () {}

  getMethod (method) {
    return (...args) => {
      console.log('argsa', args, this.asset, method)
      
      return window.providerManager.proxy('CAL_REQUEST', {
        asset: this.asset,
        method,
        args
      })
    }
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

  enable () {
    return this.proxy('ENABLE_REQUEST')
  }
}

window.providerManager = new ProviderManager()
`;

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
`;

const overrideEthereum = chain => `
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
`;

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
`;

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
`;

const solanaProvider = () => `
const REQUEST_MAP = {
  wallet_getConnectedNetwork: 'wallet.getConnectedNetwork',
  wallet_getAddresses: 'wallet.getAddresses',
  wallet_signMessage: 'wallet.signMessage',
  wallet_sendTransaction: 'chain.sendTransaction',
  wallet_parseWireTransaction: 'chain._parseWireTransaction'
}
async function handleRequest (req) {
  const solana = window.providerManager.getProviderFor('SOL')
  const method = REQUEST_MAP[req.method] || req.method
  return solana.getMethod(method)(...req.params)
}
window.solana = {
  publicKey: '',
  connected: false,
  solana: window.providerManager.getProviderFor('SOL'),
  async enable() {
    const accepted = await window.providerManager.enable()
    if (!accepted) throw new Error('User rejected')
    return this.solana.getMethod('wallet.getAddresses')()
  },
  async request(req) {
    const params = req.params || []
    return handleRequest({
      method: req.method, params
    })
  },
  async postMessage(msg) {
    const { method } = msg;
    console.log('current method', method)
    
    switch(method) {
      case 'connect': {
        await window.providerManager.enable()
        const solana = window.providerManager.getProviderFor('SOL')
        const addr = await solana.getMethod('wallet.getAddresses')()
        console.log(addr)
        this.publicKey = addr[0].publicKey
        window.postMessage({
          jsonrpc: '2.0',
          id: 1,
          method: 'connected',
          params: {
            publicKey: this.publicKey
          }
        })
        return solana.getMethod('wallet.getAddresses')()
      }
      case 'sign': {
        const solana = window.providerManager.getProviderFor('SOL')
        const message = msg.params.data.toString('hex');
        
        const signature = await this.request({
            method: REQUEST_MAP.wallet_signMessage, 
            params: [message, this.publicKey]
        })
       
        console.log('signa', signature)

        // TODO: NEEd to find a way to encode signature variable
        // const result = '{bs58.encode(Buffer.from("signature"))'

        window.postMessage({
              jsonrpc: '2.0',
              id: 2,
              result: { signature: result, publicKey: this.publicKey }
        })
        return;
      }
      case 'signTransaction': {
        const data = msg.params.message

        
        const signedTx = await this.request({
          method: REQUEST_MAP.wallet_sendTransaction, 
          params: data
        })


        console.log('signed', signedTx)
        

        window.postMessage({
          jsonrpc: '2.0',
          id: 2,
          result: { signature: result, publicKey: this.publicKey }
        })
      }
      // case 'disconnect': {
      //   window.postMessage({
      //     jsonrpc: '2.0',
      //     id: 1,
      //     method: 'disconnected',
      //     params: {
      //       publicKey: this.publicKey
      //     }
      //   })
      // }
      default: {
        return
      }
    }

  }
}
`;


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
`;

export {
  providerManager,
  ethereumProvider,
  overrideEthereum,
  bitcoinProvider,
  nearProvider,
  solanaProvider,
  paymentUriHandler
};
