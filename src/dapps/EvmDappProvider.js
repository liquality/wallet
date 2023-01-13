export class EvmDappProvider {
  _clientFactory

  constructor(clientFactory) {
    this._clientFactory = clientFactory
  }
  /**
   * Handle method requests, such as "eth_sign", "eth_sendTransaction", etc.
   * @param {*} params
   */
  async handleRequest(payload) {
    const { chainId, request } = payload
    const { method, params } = request

    const client = this._clientFactory.getClient(chainId)

    if (method === 'eth_requestAccounts') {
      return await client.getAddresses() // TODO: validate method sign
    }

    if (method === 'personal_sign') {
      const sig = await eth.getMethod('wallet.signMessage')(req.params[0], req.params[1])
      return '0x' + sig
    }

    if (['eth_signTypedData', 'eth_signTypedData_v3', 'eth_signTypedData_v4'].includes(method)) {
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
    return Promise.resolve({ method, params })
  }
}
