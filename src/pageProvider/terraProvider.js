import { COMMON_REQUEST_MAP } from './utils'

async function terraHandleRequest(req) {
  const terraProvider = window.providerManager.getProviderFor('LUNA')
  const method = COMMON_REQUEST_MAP[req.method] || req.method
  return terraProvider.getMethod(method)(...req.params)
}

function addTerraProvider() {
  window.isTerraExtensionAvailable = true
  window.terra = {
    enable: async () => {
      const accepted = await window.providerManager.enable('terra')
      if (!accepted) throw new Error('User rejected')
      const terra = window.providerManager.getProviderFor('LUNA')
      return terra.getMethod('wallet.getAddresses')()
    },
    request: async (req) => {
      const params = req.params || []
      return terraHandleRequest({
        method: req.method,
        params
      })
    }
  }
}

export { addTerraProvider }
