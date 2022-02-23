import { SwapProvider } from '../SwapProvider'
import BN from 'bignumber.js'
import { Hop, Chain } from '@hop-protocol/sdk'
import { currencyToUnit } from '@liquality/cryptoassets'
import cryptoassets from '../../utils/cryptoassets'

class HopSwapProvider extends SwapProvider {
  /**
   * Get the supported pairs of this provider for this network
   * @param {{ network }} network
   */
  // eslint-disable-next-line no-unused-vars
  async getSupportedPairs() {
    return []
  }

  /**
   * Get a quote for the specified parameters
   * @param {{ network, from, to, amount }} options
   */

  getChain(chain) {
    switch (chain) {
      case Hop.Chain.Ethereum.slug:
        return Hop.Chain.Ethereum
      case Hop.Chain.Arbitrum.slug:
        return Hop.Chain.Arbitrum
      case Hop.Chain.Gnosis.slug:
        return Hop.Chain.Gnosis
      case Hop.Chain.Optimism.slug:
        return Hop.Chain.Optimism
      case Hop.Chain.Polygon.slug:
        return Hop.Chain.Polygon
      default:
        return null
    }
  }

  _getBridgeAsset(chainFrom, chainTo, assetFrom, assetTo, hop) {
    if (!chainFrom || !chainTo || !assetFrom || !assetTo || !hop) return null
    const supportedAssetsFrom = hop.getSupportedAssetsForChain(chainFrom)
    const supportedAssetsTo = hop.getSupportedAssetsForChain(chainTo)
    if (!supportedAssetsFrom[assetFrom] || !supportedAssetsTo[assetTo]) {
      return null
    }
    return assetFrom
  }

  _getCompatibleAssets(from, to) {
    if (!from || !to) return null
    let _from, _to
    if (from !== to) {
      if (`W${from}` !== to) {
        _from = from.substring(1, from.length)
        _to = to
      }
      if (`W${to}` !== from) {
        _from = from
        _to = to.substring(1, to.length)
      }
      if (_from !== _to) return null
    }
    return { _from, _to }
  }

  _getInfo(assetFrom, assetTo, chainFrom, chainTo, hop) {
    let bridgeAsset, _chainFrom, _chainTo
    const assets = this._getCompatibleAssets(assetFrom, assetTo)
    if (!assets?._from || !assets?._to) return null
    const { _from, _to } = assets
    bridgeAsset = this._getBridgeAsset(chainFrom, chainTo, _from, _to, hop)
    _chainFrom = this.getChain(chainFrom)
    _chainTo = this.getChain(chainTo)
    return { bridgeAsset, _chainFrom, _chainTo }
  }

  getSendInfo(assetFrom, assetTo, hop) {
    const isFromL1 = assetFrom.chain === Chain.Ethereum.name.toLowerCase()
    const isFromL2 = assetTo.chain === Chain.Ethereum.name.toLowerCase()
    const info = this._getInfo(
      isFromL1 ? assetFrom.code : assetFrom.matchingAsset,
      isFromL1 ? assetTo.matchingAsset : isFromL2 ? assetTo.code : assetTo.matchingAsset,
      assetFrom.chain,
      assetTo.chain,
      hop
    )
    if (!info?.bridgeAsset || !info?._chainFrom || !info?._chainTo) return null
    return { bridgeAsset: info.bridgeAsset, chainFrom: info._chainFrom, chainTo: info._chainTo }
  }

  // eslint-disable-next-line no-unused-vars
  async getQuote({ network, from, to, amount }) {
    if (amount <= 0) return null
    const assetFrom = cryptoassets[from]
    const assetTo = cryptoassets[to]
    const hop = new Hop(network === 'mainnet' ? 'mainnet' : 'kovan')
    if (!hop.isValidChain(assetFrom.chain) || !hop.isValidChain(assetTo.chain)) return null
    const fromAmountInUnit = currencyToUnit(cryptoassets[from], BN(amount))
    const info = this.getSendInfo(assetFrom, assetTo, hop)
    if (!info?.bridgeAsset || !info?.chainFrom || !info?.chainTo) return null
    const { bridgeAsset, chainFrom, chainTo } = info
    const bridge = hop.bridge(bridgeAsset)
    const sendData = await bridge.getSendData(fromAmountInUnit.toString(), chainFrom, chainTo)
    if (!sendData?.rate) return null
    const toAmountInUnit = currencyToUnit(assetFrom, BN(amount).times(sendData.rate))
    return {
      from,
      to,
      // Amounts should be in BigNumber to prevent loss of precision
      fromAmount: fromAmountInUnit,
      toAmount: toAmountInUnit
    }
  }

  /**
   * Create a new swap for the given quote
   * @param {{ network, walletId, quote }} options
   */
  // eslint-disable-next-line no-unused-vars
  newSwap({ network, walletId, quote }) {
    throw new Error('`newSwap` not implemented')
  }

  /**
   * Estimate the fees for the given parameters
   * @param {{ network, walletId, asset, fromAccountId, toAccountId, txType, amount, feePrices[], max }} options
   * @return Object of key feePrice and value fee
   */
  // eslint-disable-next-line no-unused-vars
  async estimateFees({ network, walletId, asset, txType, quote, feePrices, max }) {
    throw new Error('`estimateFee` not implemented')
  }

  /**
   * This hook is called when state updates are required
   * @param {object} store
   * @param {{ network, walletId, swap }}
   * @return updates An object representing updates to the current swap in the history
   */
  // eslint-disable-next-line no-unused-vars
  async performNextSwapAction(store, { network, walletId, swap }) {
    throw new Error('`newSwap` not implemented')
  }

  static txTypes = {
    SWAP: 'SWAP'
  }

  static fromTxType = HopSwapProvider.txTypes.SWAP
  static toTxType = null

  static timelineDiagramSteps = ['APPROVE', 'SWAP']

  static totalSteps = 3
}

export { HopSwapProvider }
