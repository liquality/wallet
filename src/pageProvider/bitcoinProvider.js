const BITCOIN_REQUEST_MAP = {
  wallet_getConnectedNetwork: 'wallet.getConnectedNetwork',
  wallet_getAddresses: 'wallet.getAddresses',
  wallet_signMessage: 'wallet.signMessage',
  wallet_sendTransaction: 'wallet.sendTransaction',
  wallet_signPSBT: 'wallet.signPSBT'
}

async function bitcoinHandleRequest(req) {
  const btc = window.providerManager.getProviderFor('BTC')
  if (req.method === 'wallet_sendTransaction') {
    const to = req.params[0].to
    const value = req.params[0].value.toString(16)
    return btc.getMethod('wallet.sendTransaction')({ to, value })
  }
  const method = BITCOIN_REQUEST_MAP[req.method] || req.method
  return btc.getMethod(method)(...req.params)
}

function addBitcoinProvider() {
  window.bitcoin = {
    enable: async () => {
      const { accepted } = await window.providerManager.enable('bitcoin')
      if (!accepted) throw new Error('User rejected')
      const btc = window.providerManager.getProviderFor('BTC')
      return btc.getMethod('wallet.getAddresses')()
    },
    request: async (req) => {
      const params = req.params || []
      return bitcoinHandleRequest({
        method: req.method,
        params
      })
    }
  }
}

export { addBitcoinProvider }
