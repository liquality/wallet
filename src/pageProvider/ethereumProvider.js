import { UserDeclinedError } from '@liquality/error-parser'
import { PageProvider } from './pageProvider'

class EthereumPageProvider extends PageProvider {
  chain
  asset
  network

  constructor(window, chain, asset, network) {
    super(window)
    this.chain = chain
    this.asset = asset
    this.network = network
  }

  async handleRequest(req) {
    const injectionName = this.window.providerManager.getInjectionName(this.chain)
    const eth = this.window.providerManager.getProviderFor(this.asset)
    if (req.method.startsWith('metamask_')) return null

    if (req.method === 'eth_requestAccounts') {
      return await this.window[injectionName].enable(this.chain)
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
      return result.txHash
    }
    if (req.method === 'eth_accounts') {
      return this.getAddresses()
    }
    return eth.getMethod('chain.sendRpcRequest')(req.method, req.params)
  }

  async getAddresses() {
    const injectionName = this.window.providerManager.getInjectionName(this.chain)
    const eth = this.window.providerManager.getProviderFor(this.asset)
    let addresses = await eth.getMethod('wallet.getAddresses')()
    addresses = addresses.map((a) => a.address)
    this.window[injectionName].selectedAddress = addresses[0]
    return addresses
  }

  setup() {
    const metamaskEmulated = true
    //::::: when we move to manifest V3 we will fix this and implement a better way to set it
    // const metamaskEmulated = ['opensea.io', 'unstoppabledomains.com'].some(
    //   (site) => this.window.location.host.indexOf(site) !== -1
    // ) // Is some kind of smart emulation possible?

    const injectionName = this.window.providerManager.getInjectionName(this.chain)

    this.window[injectionName] = {
      isLiquality: true,
      isMetaMask: metamaskEmulated,
      isEIP1193: true,
      networkVersion: this.network.networkId,
      chainId: this.network.chainId.toString(16),
      enable: async () => {
        const { accepted } = await this.window.providerManager.enable(this.chain)
        if (!accepted) throw new UserDeclinedError()
        return this.getAddresses()
      },
      request: async (req) => {
        const params = req.params || []
        return this.handleRequest({
          method: req.method,
          params
        })
      },
      send: async (req, _paramsOrCallback) => {
        if (typeof _paramsOrCallback === 'function') {
          this.window[injectionName].sendAsync(req, _paramsOrCallback)
          return
        }
        const method = typeof req === 'string' ? req : req.method
        const params = req.params || _paramsOrCallback || []
        return this.handleRequest({ method, params }).then((result) => ({
          id: req && req.id ? req.id : 99999,
          jsonrpc: '2.0',
          result
        }))
      },
      removeAllListeners: () => {
        // mock this call for a hotfix
        return false
      },
      sendAsync: (req, callback) => {
        return this.handleRequest(req)
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
          this.window.addEventListener('liqualityChainChanged', ({ detail }) => {
            const result = JSON.parse(detail)
            callback('0x' + result.chainIds[this.chain].toString(16))
          })
        }

        if (method === 'accountsChanged') {
          this.window.addEventListener('liqualityAccountsChanged', () => {
            const addresses = this.getAddresses()
            callback(addresses)
          })
        }
      },
      autoRefreshOnNetworkChange: false
    }
  }
}

export { EthereumPageProvider }
