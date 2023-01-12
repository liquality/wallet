export class EvmDappProvider {
  /**
   * Handle method requests, such as "eth_sign", "eth_sendTransaction", etc.
   * @param {*} request
   */
  async handleRequest({ method, params }) {
    console.log('handleRequest', { method, params })
    return Promise.resolve({ method, params })
  }
}
