import { COMMON_REQUEST_MAP } from './utils'

async function solanaHandleRequest(req) {
  const solana = window.providerManager.getProviderFor('SOL')
  const method = COMMON_REQUEST_MAP[req.method] || req.method
  return solana.getMethod(method)(...req.params)
}

function addSolanaProvider() {
  window.sollet = {
    enable: async () => {
      const { accepted } = await window.providerManager.enable('solana')
      if (!accepted) throw new Error('User rejected')
      const solana = window.providerManager.getProviderFor('SOL')
      return solana.getMethod('wallet.getAddresses')()
    },
    request: async (req) => {
      const params = req.params || []
      return solanaHandleRequest({
        method: req.method,
        params
      })
    }
  }
}

export { addSolanaProvider }
