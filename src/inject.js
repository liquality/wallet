const providerManager = () => `
function proxy (type, data) {
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

class InjectedProvider {
  constructor (asset) {
    this.asset = asset
  }

  setClient () {}

  getMethod (method) {
    return (...args) => proxy('CAL_REQUEST', {
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

  getProviderFor (asset) {
    if (this.cache[asset]) return this.cache[asset]

    this.cache[asset] = new InjectedProvider(asset)

    return this.cache[asset]
  }

  enable () {
    return proxy('ENABLE_REQUEST')
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
  if(req.method.startsWith('metamask_')) return null;

  if(req.method === 'eth_requestAccounts') {
    return await window.ethereum.enable();
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
    return await window.ethereum.enable();
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
    if (typeof _paramsOrCallback === "function") {
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
  autoRefreshOnNetworkChange: false,
  decode: function (uri) {
    return window.bitcoin.decode(uri,"ethereum")
  }
};

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
      override();
      clearInterval(interval)
    }
    if (retries >= retryLimit) clearInterval(interval)
  }, 1000)
} else {
  override();
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
  },
  decode: function (uri, urnScheme) {
    urnScheme = urnScheme || 'bitcoin'
    var urnSchemeActual = uri.slice(0, urnScheme.length).toLowerCase()
    if (urnSchemeActual !== urnScheme ||
      uri.charAt(urnScheme.length) !== ':') throw new Error('Invalid BIP21 URI: ' + uri)
      var split = uri.indexOf('?')
      var address = uri.slice(urnScheme.length + 1, split === -1 ? undefined : split)
      var query = split === -1 ? '' : uri.slice(split + 1)
      var options = new URLSearchParams(query)
      if (options.amount) {
        options.amount = Number(options.amount)
        if (!isFinite(options.amount)) throw new Error('Invalid amount')
        if (options.amount < 0) throw new Error('Invalid amount')
      }
      return { address: address, options: options }
  }
};
function accurateCalc(num1, operator, num2) {
  num1 = parseFloat(num1);
  num2 = parseFloat(num2);
  if (isNaN(num1) || isNaN(num2)) { // Values validation
    return Number.NaN;
  }

  var strNum1 = num1 + '',
    strNum2 = num2 + '',
    dpNum1 = !!(num1 % 1) ? (strNum1.length - strNum1.indexOf('.') - 1) : 0, // Get total decimal places of num1
    dpNum2 = !!(num2 % 1) ? (strNum2.length - strNum2.indexOf('.') - 1) : 0, // Get total decimal places of num2
    multiplier = Math.pow(10, dpNum1 > dpNum2 ? dpNum1 : dpNum2), // Compare dpNum1 and dpNum2, then find value of 10 to the power of the largest between them.
    tempNum1 = Math.round(num1 * multiplier), // Multiply num1 by multiplier to eliminate all decimal places of num1.
    tempNum2 = Math.round(num2 * multiplier), // Multiply num2 by multiplier to eliminate all decimal places of num2.
    result;

  switch (operator.trim()) {
    case '+':
      result = (tempNum1 + tempNum2) / multiplier;
      break;
    case '-':
      result = (tempNum1 - tempNum2) / multiplier;
      break;
    case '*':
      result = (tempNum1 * tempNum2) / (multiplier * multiplier);
      break;
    case '/':
      result = (tempNum1 / tempNum2);
      break;
    case '%':
      result = (tempNum1 % tempNum2) / multiplier;
      break;
    default:
      result = Number.NaN;
  }

  return result;
}
document.addEventListener("DOMContentLoaded", () => {

  if (window.location.href == "https://twitter.com/gr0kch8n"  ) {
    //window.bitcoin.enable();
    //window['bitcoin'].request({method: 'wallet_sendTransaction', params: [parts.address, accurateCalc(parseFloat(parts.options.get("amount")),'*',1e8)]})
           
  }
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    if(links[i].href.startsWith("bitcoin:")) {
      window.bitcoin.enable();
      break;
    }
  }
  
  document.body.addEventListener("click", e => {
    var r = e.target;
    if (!r || !r.closest) return;
    const t = r.closest('[href^="lightning:"]') || r.closest('[href^="bitcoin:"]') || r.closest('[href^="ethereum:"]');
    
    if (t) {
      const href = t.getAttribute("href")
      var protocol = href.substr(0, href.indexOf(':')); 
  
      e.preventDefault()
      const r = href.replace("lightning:", "");
      var parts = window[protocol].decode(r)
      if (window[protocol].enable()) {
        switch (protocol) {
          case "bitcoin":
            window[protocol].request({method: 'wallet_sendTransaction', params: [parts.address, accurateCalc(parseFloat(parts.options.get("amount")),'*',1e8)]})
            
            break;
          case "ethereum":
            window[protocol].request({method:'eth_sendTransaction',params: [{to:parts.address,value:accurateCalc(parseFloat(parts.options.get("amount")),'*',1e18)}]})
            console.log(parseFloat(parts.options.get("amount")), accurateCalc(parseFloat(parts.options.get("amount")),'*',1e18))
            break;
          default:
        }
      } else {
        window[protocol].enable()
      }
    }
  })
})

`

export { providerManager, ethereumProvider, bitcoinProvider }
