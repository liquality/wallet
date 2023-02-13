export class EvmDappProvider {
  _store
  _chainId

  constructor(chainId, store) {
    this._chainId = chainId
    this._store = store
  }
  /**
   * Handle method requests, such as "eth_sign", "eth_sendTransaction", etc.
   * @param {*} payload
   */
  async handleRequest(payload) {
    const { chainId, method, params, accountId } = payload

    // const client = this._getters.client({ network, walletId, chainId, accountId });

    // if (method === 'eth_requestAccounts') {
    //   return await client.getAddresses() // TODO: validate method sign
    // }

    // if (method === 'personal_sign') {
    //   const sig = await client.getMethod('wallet.signMessage')(params[0], params[1])
    //   return '0x' + sig
    // }

    // if (['eth_signTypedData', 'eth_signTypedData_v3', 'eth_signTypedData_v4'].includes(method)) {
    //   const sig = await client.getMethod('wallet.signTypedData')(request)
    //   return sig
    // }

    // if (method === 'eth_sendTransaction') {
    //   const to = params[0].to
    //   const value = params[0].value
    //   const data = params[0].data
    //   const gas = params[0].gasPrice
    //   const result = await client.getMethod('wallet.sendTransaction')({ to, value, data, gas })
    //   return result.txHash
    // }
    // if (method === 'eth_accounts') {
    //   return client.getAddresses() // this.getAddresses()
    // }
    // return client.getMethod('chain.sendRpcRequest')(method, params)
    const { activeNetwork, activeWalletId } = this._store.state

    const result = await this._store.dispatch(
      'sendTransaction',
      {
        network: activeNetwork,
        walletId: activeWalletId,
        asset: 'ETH',
        accountId,
        to: params[0].to,
        amount: params[0].value,
        data: params[0].data,
        //fee: request.args[0].fee,
        //feeAsset: request.args[0].feeAsset,
        //feeLabel: request.args[0].feeLabel,
        gas: params[0].gasPrice
      },
      { root: true }
    )

    console.log('payload', { chainId, method, params })
    console.log('state', { activeNetwork, activeWalletId })
    return result.txHash
  }
}
