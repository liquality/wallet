import { getChainInfo } from '../utils/chains'
import { getNativeAssetCode, getChain } from '@liquality/cryptoassets'
export class EvmDappProvider {
  _store
  _chainId

  constructor(chainId, store) {
    this._chainId = chainId
    this._store = store
  }

  _requestMapping = {
    eth_sendTransaction: this.sendTransaction,
    eth_signTypedData: this.sign,
    eth_signTypedData_v3: this.sign,
    eth_signTypedData_v4: this.sign,
    eth_accounts: this.getAccounts
  }
  /**
   * Handle method requests, such as "eth_sign", "eth_sendTransaction", etc.
   * @param {*} payload
   */
  async handleRequest(payload) {
    const { chainId, method, params, accountId } = payload
    const { activeNetwork, activeWalletId } = this._store.state
    const namespace = this._chainId.split(':')[0]
    const chainInfo = getChainInfo(namespace, chainId)

    console.log('handleRequest =>', {
      chainId,
      method,
      activeNetwork,
      activeWalletId,
      params,
      accountId,
      asset
    })
    if (activeNetwork !== chainInfo.networkName) {
      throw new Error('Network name mismatch')
    }
    const asset = getNativeAssetCode(chainInfo.networkName, chainInfo.chainName)

    return this._requestMapping[method]({
      chainId,
      method,
      activeNetwork,
      activeWalletId,
      params,
      accountId,
      chainInfo,
      asset
    })
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
      chainId: chainInfo.chainName,
      accountId
    })
    const addresses = await _client.wallet.getAddresses()
    const chainUtils = getChain(activeNetwork, chainInfo.chainName)
    return addresses.map((a) => chainUtils.formatAddress(a.address))
  }

  async sign({ activeNetwork, activeWalletId, params, accountId, chainInfo }) {
    const { getters } = this._store
    const _client = getters.client({
      network: activeNetwork,
      walletId: activeWalletId,
      chainId: chainInfo.chainName,
      accountId
    })
    const sig = await _client.wallet.signTypedData(params)
    return sig
  }
}
