import { UserDeclinedError } from '@liquality/error-parser'
import { PageProvider } from './pageProvider'

const BITCOIN_REQUEST_MAP = {
  wallet_getConnectedNetwork: 'wallet.getConnectedNetwork',
  wallet_getAddresses: 'wallet.getAddresses',
  wallet_signMessage: 'wallet.signMessage',
  wallet_sendTransaction: 'wallet.sendTransaction',
  wallet_signPSBT: 'wallet.signPSBT'
}

class BitcoinPageProvider extends PageProvider {
  async handleRequest(req) {
    const btc = this.window.providerManager.getProviderFor('BTC')
    if (req.method === 'wallet_sendTransaction') {
      const to = req.params[0].to
      const value = req.params[0].value.toString(16)
      return btc.getMethod('wallet.sendTransaction')({ to, value })
    }
    const method = BITCOIN_REQUEST_MAP[req.method] || req.method
    return btc.getMethod(method)(...req.params)
  }
  setup() {
    this.window.bitcoin = {
      enable: async () => {
        const { accepted } = await this.window.providerManager.enable('bitcoin')
        if (!accepted) throw new UserDeclinedError()

        const btc = this.window.providerManager.getProviderFor('BTC')
        return btc.getMethod('wallet.getAddresses')()
      },
      request: async (req) => {
        const params = req.params || []
        return this.handleRequest({
          method: req.method,
          params
        })
      }
    }
  }
}

export { BitcoinPageProvider }
