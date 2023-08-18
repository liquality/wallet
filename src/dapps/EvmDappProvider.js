import { getChainInfo } from '../utils/chains'
import { getNativeAssetCode, getChain } from '@liquality/cryptoassets'
export class EvmDappProvider {
  _store
  _chainId

  constructor(chainId, store) {
    this._chainId = chainId
    this._store = store
  }

  async batchRequest(payload) {
    let results = []
    const { chainId, method, params, accountId } = payload
    console.log('batchRequest', { chainId, method, params, accountId })
    for (const rq of params) {
      const resp = await this.handleRequest({ accountId, ...rq })
      results.push(resp)
    }

    return results
  }
  /**
   * Handle method requests, such as "eth_sign", "eth_sendTransaction", etc.
   * @param {*} payload
   */
  async handleRequest(payload) {
    const { chainId, method, params, accountId } = payload
    const { activeNetwork, activeWalletId } = this._store.state
    const [namespace, chain] = this._chainId.split(':')
    const chainInfo = getChainInfo(namespace, chain)

    if (activeNetwork !== chainInfo.networkName) {
      throw new Error('Network name mismatch')
    }
    const asset = getNativeAssetCode(chainInfo.networkName, chainInfo.name)
    console.log('handleRequest =>', {
      chainId,
      method,
      activeNetwork,
      activeWalletId,
      params,
      accountId,
      asset
    })
    try {
      const req = {
        chainId,
        method,
        activeNetwork,
        activeWalletId,
        params,
        accountId,
        chainInfo,
        asset
      }
      let result
      switch (method) {
        case 'eth_sendTransaction':
          result = await this.sendTransaction(req)
          break
        case 'eth_signTypedData':
          result = await this.sign(req)
          break
        case 'eth_signTypedData_v3':
          result = await this.sign(req)
          break
        case 'eth_signTypedData_v4':
          result = await this.sign(req)
          break
        case 'eth_accounts':
          result = await this.getAccounts(req)
          break
        case 'personal_sign':
          result = await this.personalSign(req)
          break
        case 'batch_request':
          result = await this.batchRequest(req)
          break
        default:
          result = null
          break
      }

      return { result }
    } catch (error) {
      return { error }
    }
  }

  async sendTransaction({ activeNetwork, activeWalletId, params, accountId, asset }) {
    const result = await this._store.dispatch(
      'sendTransaction',
      {
        network: activeNetwork,
        walletId: activeWalletId,
        asset,
        accountId,
        to: params[0].to,
        amount: params[0].value,
        data: params[0].data,
        fee: params[0].fee, // not part of the standard
        feeAsset: params[0].feeAsset, // not part of the standard
        feeLabel: params[0].feeLabel, // not part of the standard
        gas: params[0].gasPrice // CHECK if we should use gas or gasPrice
      },
      { root: true }
    )

    return result.txHash
  }

  async getAccounts({ activeNetwork, activeWalletId, accountId, chainInfo }) {
    const { getters } = this._store
    const _client = getters.client({
      network: activeNetwork,
      walletId: activeWalletId,
      chainId: chainInfo.name,
      accountId
    })
    const addresses = await _client.wallet.getAddresses()
    const chainUtils = getChain(activeNetwork, chainInfo.name)
    return addresses.map((a) => chainUtils.formatAddress(a.address))
  }

  async sign({ activeNetwork, activeWalletId, params, accountId, chainInfo }) {
    const { getters } = this._store
    const _client = getters.client({
      network: activeNetwork,
      walletId: activeWalletId,
      chainId: chainInfo.name,
      accountId
    })
    const sig = await _client.wallet.signTypedData(params)
    return sig
  }

  async personalSign({ activeNetwork, activeWalletId, params, accountId, chainInfo }) {
    const { getters } = this._store
    const _client = getters.client({
      network: activeNetwork,
      walletId: activeWalletId,
      chainId: chainInfo.name,
      accountId
    })
    const [message, address] = params
    const sig = await _client.wallet.signMessage(message, address)
    return '0x' + sig
  }
}
