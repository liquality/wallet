import { COMMON_REQUEST_MAP } from './utils'
import { PageProvider } from './pageProvider'
import { UserDeclinedError } from '@liquality/error-parser'

class NearPageProvider extends PageProvider {
  async handleRequest(req) {
    const near = this.window.providerManager.getProviderFor('NEAR')
    const method = COMMON_REQUEST_MAP[req.method] || req.method
    return near.getMethod(method)(...req.params)
  }

  setup() {
    this.window.near = {
      enable: async () => {
        const { accepted } = await this.window.providerManager.enable('near')
        if (!accepted) throw new UserDeclinedError()
        const near = this.window.providerManager.getProviderFor('NEAR')
        return near.getMethod('wallet.getAddresses')()
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

export { NearPageProvider }
