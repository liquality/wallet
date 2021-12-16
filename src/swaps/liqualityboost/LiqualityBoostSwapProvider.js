import BN from 'bignumber.js'
import { SwapProvider } from '../SwapProvider'
import { unitToCurrency, assets } from '@liquality/cryptoassets'
import { withInterval } from '../../store/actions/performNextAction/utils'
import { prettyBalance } from '../../utils/coinFormatter'
import { isERC20, getNativeAsset } from '@/utils/asset'
import { createSwapProvider } from '../../store/factory/swapProvider'
import { LiqualitySwapProvider } from '../liquality/LiqualitySwapProvider'
import { OneinchSwapProvider } from '../oneinch/OneinchSwapProvider'

const slippagePercentage = 3

class LiqualityBoostSwapProvider extends SwapProvider {
  constructor (config) {
    super(config)
    this.liqualitySwapProvider = createSwapProvider(this.config.network, 'liquality')
    this.sovrynSwapProvider = createSwapProvider(this.config.network, 'sovryn')
    this.supportedBridgeAssets = this.config.supportedBridgeAssets

    if (this.config.network === 'mainnet') {
      this.oneinchSwapProvider = createSwapProvider(this.config.network, 'oneinchV3')
      this.bridgeAssetToAutomatedMarketMaker = {
        MATIC: this.oneinchSwapProvider,
        ETH: this.oneinchSwapProvider,
        BNB: this.oneinchSwapProvider,
        RBTC: this.sovrynSwapProvider
      }
    } else if (this.config.network === 'testnet') {
      this.bridgeAssetToAutomatedMarketMaker = {
        RBTC: this.sovrynSwapProvider
      }
    }
  }

  async getSupportedPairs () {
    return []
  }

  async getQuote ({ network, from, to, amount }) {
    if (isERC20(from) || !isERC20(to) || amount <= 0) return null
    const bridgeAsset = getNativeAsset(to)
    if (!(this.supportedBridgeAssets.includes(bridgeAsset))) return null
    const quote = await this.liqualitySwapProvider.getQuote({ network, from, to: bridgeAsset, amount })
    if (!quote) return null
    const bridgeAssetQuantity = unitToCurrency(assets[bridgeAsset], quote.toAmount)
    const finalQuote = await this.bridgeAssetToAutomatedMarketMaker[bridgeAsset].getQuote({ network, from: bridgeAsset, to, amount: bridgeAssetQuantity.toNumber() })
    if (!finalQuote) return null
    return {
      from,
      to,
      fromAmount: quote.fromAmount,
      toAmount: finalQuote.toAmount,
      bridgeAsset,
      bridgeAssetAmount: quote.toAmount,
      path: finalQuote.path
    }
  }

  async newSwap ({ network, walletId, quote: _quote }) {
    const result = await this.liqualitySwapProvider.newSwap({ network, walletId, quote: { ..._quote, to: _quote.bridgeAsset, toAmount: _quote.bridgeAssetAmount } })
    return {
      ...result,
      ..._quote,
      slippage: slippagePercentage * 100,
      bridgeAssetAmount: result.toAmount
    }
  }

  async updateOrder (order) {
    return await (this.liqualitySwapProvider.updateOrder(order))
  }

  async estimateFees ({ network, walletId, asset, txType, quote, feePrices, max }) {
    const liqualityFees = await this.liqualitySwapProvider.estimateFees({ network, walletId, asset, txType: txType === LiqualityBoostSwapProvider.txTypes.SWAP ? LiqualityBoostSwapProvider.txTypes.SWAP_CLAIM : txType, quote: { ...quote, to: quote.bridgeAsset, toAmount: quote.bridgeAssetAmount }, feePrices, max })
    if (isERC20(asset) && txType === LiqualityBoostSwapProvider.txTypes.SWAP) {
      const automatedMarketMakerFees = await this.bridgeAssetToAutomatedMarketMaker[quote.bridgeAsset].estimateFees({ network, walletId, asset, txType: LiqualityBoostSwapProvider.txTypes.SWAP, quote: { ...quote, from: quote.bridgeAsset, fromAmount: quote.bridgeAssetAmount, fromAccountId: quote.toAccountId, slippagePercentage }, feePrices, max })
      const totalFees = {}
      for (const key in automatedMarketMakerFees) {
        totalFees[key] = BN(automatedMarketMakerFees[key]).plus(liqualityFees[key])
      }
      return totalFees
    }
    return liqualityFees
  }

  async finalizeLiqualitySwapAndStartAutomatedMarketMaker ({ swap, network, walletId }) {
    const result = await this.liqualitySwapProvider.waitForClaimConfirmations({ swap, network, walletId })
    if (result?.status === 'SUCCESS') return { endTime: Date.now(), status: 'APPROVE_CONFIRMED' }
  }

  async performNextSwapAction (store, { network, walletId, swap }) {
    let updates
    const swapLiqualityFormat = { ...swap, to: swap.bridgeAsset, toAmount: swap.bridgeAssetAmount, slippagePercentage }
    const swapAutomatedMarketMakerFormat = { ...swap, from: swap.bridgeAsset, fromAmount: swap.bridgeAssetAmount, fromAccountId: swap.toAccountId, slippagePercentage, fee: swap.claimFee }
    if (swap.status === 'WAITING_FOR_CLAIM_CONFIRMATIONS') {
      updates = await withInterval(async () => this.finalizeLiqualitySwapAndStartAutomatedMarketMaker({ swap: swapLiqualityFormat, network, walletId }))
    } else {
      updates = await this.liqualitySwapProvider.performNextSwapAction(store, { network, walletId, swap: swapLiqualityFormat })
    }

    if (!updates) {
      updates = await this.bridgeAssetToAutomatedMarketMaker[swap.bridgeAsset].performNextSwapAction(store, { network, walletId, swap: swapAutomatedMarketMakerFormat })
    }
    return updates
  }

  static txTypes = {
    ...LiqualitySwapProvider.txTypes,
    ...OneinchSwapProvider.txTypes
  }

  static statuses = {
    ...LiqualitySwapProvider.statuses,
    ...OneinchSwapProvider.statuses,
    FUNDED: {
      ...LiqualitySwapProvider.statuses.FUNDED,
      label: 'Locking {bridgeAsset}'
    },
    CONFIRM_COUNTER_PARTY_INITIATION: {
      ...LiqualitySwapProvider.statuses.CONFIRM_COUNTER_PARTY_INITIATION,
      label: 'Locking {bridgeAsset}',
      notification (swap) {
        return {
          message: `Counterparty sent ${prettyBalance(swap.bridgeAssetAmount, swap.bridgeAsset)} ${swap.bridgeAsset} to escrow`
        }
      }
    },
    READY_TO_CLAIM: {
      ...LiqualitySwapProvider.statuses.READY_TO_CLAIM,
      label: 'Claiming {bridgeAsset}'
    },
    WAITING_FOR_CLAIM_CONFIRMATIONS: {
      ...LiqualitySwapProvider.statuses.WAITING_FOR_CLAIM_CONFIRMATIONS,
      label: 'Claiming {bridgeAsset}'
    },
    APPROVE_CONFIRMED: {
      ...OneinchSwapProvider.statuses.APPROVE_CONFIRMED,
      step: 3,
      label: 'Swapping {bridgeAsset} for {to}'
    },
    WAITING_FOR_SWAP_CONFIRMATIONS: {
      ...OneinchSwapProvider.statuses.WAITING_FOR_SWAP_CONFIRMATIONS,
      notification () {
        return {
          message: 'Engaging Automated Market Maker'
        }
      },
      step: 3
    },
    SUCCESS: {
      ...LiqualitySwapProvider.statuses.SUCCESS,
      step: 4
    },
    FAILED: {
      ...OneinchSwapProvider.statuses.FAILED,
      step: 4
    }
  }

  static fromTxType = LiqualityBoostSwapProvider.txTypes.SWAP_INITIATION
  static toTxType = LiqualityBoostSwapProvider.txTypes.SWAP

  static timelineDiagramSteps = [
    'INITIATION',
    'AGENT_INITIATION',
    'CLAIM_OR_REFUND',
    'SWAP'
  ]

  static totalSteps = 5
}

export { LiqualityBoostSwapProvider }
