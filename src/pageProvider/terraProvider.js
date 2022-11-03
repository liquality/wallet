import { UserDeclinedError } from '@liquality/error-parser'
import { PageProvider } from './pageProvider'
import { COMMON_REQUEST_MAP } from './utils'

class TerraPageProvider extends PageProvider {
  async handleRequest(req) {
    const terraProvider = this.window.providerManager.getProviderFor('LUNA')
    const method = COMMON_REQUEST_MAP[req.method] || req.method
    return terraProvider.getMethod(method)(...req.params)
  }

  setup() {
    this.window.isTerraExtensionAvailable = true
    this.window.terra = {
      enable: async () => {
        const accepted = await this.window.providerManager.enable('terra')
        if (!accepted) throw new UserDeclinedError()
        const terra = this.window.providerManager.getProviderFor('LUNA')
        return terra.getMethod('wallet.getAddresses')()
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

export { TerraPageProvider }
