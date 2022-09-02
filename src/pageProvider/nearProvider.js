import { COMMON_REQUEST_MAP } from './utils'

async function nearHandleRequest(req) {
  const near = window.providerManager.getProviderFor('NEAR')
  const method = COMMON_REQUEST_MAP[req.method] || req.method
  return near.getMethod(method)(...req.params)
}

function addNearProvider() {
  window.near = {
    enable: async () => {
      const { accepted } = await window.providerManager.enable('near')
      if (!accepted) throw new Error('User rejected')
      const near = window.providerManager.getProviderFor('NEAR')
      return near.getMethod('wallet.getAddresses')()
    },
    request: async (req) => {
      const params = req.params || []
      return nearHandleRequest({
        method: req.method,
        params
      })
    }
  }
}

export { addNearProvider }
