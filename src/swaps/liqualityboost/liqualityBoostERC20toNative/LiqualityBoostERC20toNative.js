import BN from 'bignumber.js'
import { SwapProvider } from '../../SwapProvider'
import { unitToCurrency, assets } from '@liquality/cryptoassets'
import { withInterval } from '../../../store/actions/performNextAction/utils'
import { prettyBalance } from '../../../utils/coinFormatter'
import { isERC20, getNativeAsset } from '@/utils/asset'
import { LiqualitySwapProvider } from '../../liquality/LiqualitySwapProvider'
import { OneinchSwapProvider } from '../../oneinch/OneinchSwapProvider'
import { createSwapProvider } from '../../../store/factory/swapProvider'

const slippagePercentage = 3

class LiqualityBoostERC20toNative extends SwapProvider {
  constructor(config) {
    super(config)
    this.liqualitySwapProvider = createSwapProvider(this.config.network, 'liquality')
    this.sovrynSwapProvider = createSwapProvider(this.config.network, 'sovryn')
    this.supportedBridgeAssets = this.config.supportedBridgeAssets

    if (this.config.network === 'mainnet') {
      this.oneinchSwapProvider = createSwapProvider(this.config.network, 'oneinchV4')
      this.bridgeAssetToAutomatedMarketMaker = {
        MATIC: this.oneinchSwapProvider,
        ETH: this.oneinchSwapProvider,
        BNB: this.oneinchSwapProvider,
        RBTC: this.sovrynSwapProvider,
        AVAX: this.oneinchSwapProvider
      }
    } else if (this.config.network === 'testnet') {
      this.bridgeAssetToAutomatedMarketMaker = {
        RBTC: this.sovrynSwapProvider
      }
    }
  }

  async getSupportedPairs() {
    return []
  }

  async getQuote({ network, from, to, amount }) {
    if (!isERC20(from) || isERC20(to) || amount <= 0) return null

    // get native asset of ERC20 network
    const bridgeAsset = getNativeAsset(from)
    if (!this.supportedBridgeAssets.includes(bridgeAsset)) return null

    // get rate between ERC20 and it's native token (aka bridge asset)
    const quote = await this.bridgeAssetToAutomatedMarketMaker[bridgeAsset].getQuote({
      network,
      from,
      to: bridgeAsset,
      amount
    })
    if (!quote) return null

    // get rate between native asset and 'to' asset (which is native too)
    const bridgeAssetQuantity = unitToCurrency(assets[bridgeAsset], quote.toAmount)
    const finalQuote = await this.liqualitySwapProvider.getQuote({
      network,
      from: bridgeAsset,
      to,
      amount: bridgeAssetQuantity.toNumber()
    })
    if (!finalQuote) return null

    return {
      from,
      to,
      fromAmount: quote.fromAmount,
      toAmount: finalQuote.toAmount,
      bridgeAsset,
      bridgeAssetAmount: quote.toAmount,
      path: quote.path
    }
  }

  async newSwap({ network, walletId, quote: _quote }) {
    // ERC20 -> Bridge asset
    const result = await this.bridgeAssetToAutomatedMarketMaker[_quote.bridgeAsset].newSwap({
      network,
      walletId,
      quote: this.swapAutomatedMarketMakerFormat(_quote)
    })

    return {
      ...result,
      ..._quote,
      slippage: slippagePercentage * 100
    }
  }

  async updateOrder(order) {
    return await this.liqualitySwapProvider.updateOrder(order)
  }

  // On FROM_CHAIN calculate fees from AMM swap and `swap initiation` on LSP
  // On TO_CHAIN calculate fees from `swap claim` in LSP
  async estimateFees({ network, walletId, asset, txType, quote, feePrices, max }) {
    const input = { network, walletId, asset, txType, quote, feePrices, max }

    if (txType === this.fromTxType) {
      // swap initiation fee
      const liqualityFees = await this.liqualitySwapProvider.estimateFees({
        ...input,
        asset: quote.bridgeAsset,
        txType: LiqualitySwapProvider.fromTxType,
        quote: this.swapLiqualityFormat(quote)
      })

      // amm fee
      const automatedMarketMakerFees = await this.bridgeAssetToAutomatedMarketMaker[
        quote.bridgeAsset
      ].estimateFees({
        ...input,
        // all AMMs have the same fromTxType
        txType: OneinchSwapProvider.fromTxType,
        quote: this.swapAutomatedMarketMakerFormat(quote)
      })

      const combinedFees = {}
      for (const key in automatedMarketMakerFees) {
        combinedFees[key] = BN(automatedMarketMakerFees[key]).plus(liqualityFees[key])
      }

      return combinedFees
    }

    if (txType === this.toTxType) {
      // swap claim fee
      const liqualityFees = await this.liqualitySwapProvider.estimateFees({
        ...input,
        txType: LiqualitySwapProvider.toTxType,
        quote: this.swapLiqualityFormat(quote)
      })
      return liqualityFees
    }
  }

  async finalizeAutomatedMarketMakerAndStartLiqualitySwap({
    swapLiqualityFormat,
    swapAMMFormat,
    network,
    walletId
  }) {
    let result = await this.bridgeAssetToAutomatedMarketMaker[
      swapAMMFormat.bridgeAsset
    ].waitForSwapConfirmations({
      swap: swapAMMFormat,
      network,
      walletId
    })

    if (result?.status === 'SUCCESS') {
      result = await this.liqualitySwapProvider.newSwap({
        network,
        walletId,
        quote: swapLiqualityFormat
      })

      return {
        ...result,
        ...swapLiqualityFormat,
        toAmount: result.toAmount,
        status: result.status
      }
    }
  }

  async performNextSwapAction(store, { network, walletId, swap }) {
    let updates

    if (swap.status === 'WAITING_FOR_SWAP_CONFIRMATIONS') {
      updates = await withInterval(async () =>
        this.finalizeAutomatedMarketMakerAndStartLiqualitySwap({
          swapLiqualityFormat: this.swapLiqualityFormat(swap),
          swapAMMFormat: this.swapAutomatedMarketMakerFormat(swap),
          network,
          walletId
        })
      )
    } else {
      updates = await this.liqualitySwapProvider.performNextSwapAction(store, {
        network,
        walletId,
        swap: this.swapLiqualityFormat(swap)
      })
    }

    if (!updates && !LiqualityBoostERC20toNative.lspEndStates.includes(swap.status)) {
      updates = await this.bridgeAssetToAutomatedMarketMaker[
        swap.bridgeAsset
      ].performNextSwapAction(store, {
        network,
        walletId,
        swap: this.swapAutomatedMarketMakerFormat(swap)
      })
    }

    if (!updates) return

    return {
      ...updates,
      // reset from and to assets and values
      from: swap.from,
      fromAmount: swap.fromAmount,
      to: swap.to,
      // keep `toAmount` (from updates object) only in case swap transitioned from AMM to LSP
      toAmount: updates.status === 'INITIATED' ? updates.toAmount : swap.toAmount
    }
  }

  swapLiqualityFormat = (swap) => {
    return {
      ...swap,
      from: swap.bridgeAsset,
      fromAmount: swap.bridgeAssetAmount,
      slippagePercentage
    }
  }

  swapAutomatedMarketMakerFormat = (swap) => {
    return {
      ...swap,
      to: swap.bridgeAsset,
      toAmount: swap.bridgeAssetAmount,
      toAccountId: swap.fromAccountId, // AMM swaps happen on same account
      slippagePercentage
    }
  }

  static txTypes = {
    FROM_CHAIN: 'FROM_CHAIN',
    TO_CHAIN: 'TO_CHAIN'
  }

  static statuses = {
    ...LiqualitySwapProvider.statuses,
    ...OneinchSwapProvider.statuses,
    // AAM states
    APPROVE_CONFIRMED: {
      ...OneinchSwapProvider.statuses.APPROVE_CONFIRMED,
      label: 'Swapping {from} for {bridgeAsset}'
    },
    WAITING_FOR_SWAP_CONFIRMATIONS: {
      ...OneinchSwapProvider.statuses.WAITING_FOR_SWAP_CONFIRMATIONS,
      label: 'Swapping {from} for {bridgeAsset}',
      notification() {
        return {
          message: 'Engaging Automated Market Maker'
        }
      }
    },
    // Liquality swap states
    INITIATED: {
      ...LiqualitySwapProvider.statuses.INITIATED,
      step: 2,
      label: 'Locking {bridgeAsset}'
    },
    INITIATION_REPORTED: {
      ...LiqualitySwapProvider.statuses.INITIATION_REPORTED,
      step: 2,
      label: 'Locking {bridgeAsset}'
    },
    INITIATION_CONFIRMED: {
      ...LiqualitySwapProvider.statuses.INITIATION_CONFIRMED,
      step: 2,
      label: 'Locking {bridgeAsset}'
    },
    FUNDED: {
      ...LiqualitySwapProvider.statuses.FUNDED,
      step: 3,
      label: 'Locking {bridgeAsset}'
    },
    CONFIRM_COUNTER_PARTY_INITIATION: {
      ...LiqualitySwapProvider.statuses.CONFIRM_COUNTER_PARTY_INITIATION,
      label: 'Locking {bridgeAsset}',
      notification(swap) {
        return {
          message: `Counterparty sent ${prettyBalance(swap.bridgeAssetAmount, swap.bridgeAsset)} ${
            swap.bridgeAsset
          } to escrow`
        }
      },
      step: 3
    },
    READY_TO_CLAIM: {
      ...LiqualitySwapProvider.statuses.READY_TO_CLAIM,
      step: 4
    },
    WAITING_FOR_CLAIM_CONFIRMATIONS: {
      ...LiqualitySwapProvider.statuses.WAITING_FOR_CLAIM_CONFIRMATIONS,
      step: 4
    },
    WAITING_FOR_REFUND: {
      ...LiqualitySwapProvider.statuses.WAITING_FOR_REFUND,
      step: 4
    },
    GET_REFUND: {
      ...LiqualitySwapProvider.statuses.GET_REFUND,
      label: 'Refunding {bridgeAsset}',
      step: 4
    },
    WAITING_FOR_REFUND_CONFIRMATIONS: {
      ...LiqualitySwapProvider.statuses.WAITING_FOR_REFUND_CONFIRMATIONS,
      label: 'Refunding {bridgeAsset}',
      step: 4
    },
    // final states
    REFUNDED: {
      ...LiqualitySwapProvider.statuses.REFUNDED,
      step: 5
    },
    SUCCESS: {
      ...LiqualitySwapProvider.statuses.SUCCESS,
      step: 5
    },
    QUOTE_EXPIRED: {
      ...LiqualitySwapProvider.statuses.QUOTE_EXPIRED,
      step: 5
    },
    FAILED: {
      ...OneinchSwapProvider.statuses.FAILED,
      step: 5
    }
  }

  static lspEndStates = ['REFUNDED', 'SUCCESS', 'QUOTE_EXPIRED']

  static fromTxType = LiqualityBoostERC20toNative.txTypes.FROM_CHAIN
  static toTxType = LiqualityBoostERC20toNative.txTypes.TO_CHAIN

  static timelineDiagramSteps = [
    'APPROVE',
    'SWAP',
    'INITIATION',
    'AGENT_INITIATION',
    'CLAIM_OR_REFUND'
  ]

  static totalSteps = 6
}

export { LiqualityBoostERC20toNative }
