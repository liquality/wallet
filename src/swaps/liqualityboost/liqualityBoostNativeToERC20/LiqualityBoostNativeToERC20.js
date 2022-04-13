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

class LiqualityBoostNativeToERC20 extends SwapProvider {
  constructor(config) {
    super(config)
    this.liqualitySwapProvider = createSwapProvider(this.config.network, 'liquality')
    this.sovrynSwapProvider = createSwapProvider(this.config.network, 'sovryn')
    this.supportedBridgeAssets = this.config.supportedBridgeAssets

    if (this.config.network === 'mainnet') {
      this.oneinchSwapProvider = createSwapProvider(this.config.network, 'oneinchV4')
      this.astroportSwapProvider = createSwapProvider(this.config.network, 'astroport')
      this.bridgeAssetToAutomatedMarketMaker = {
        MATIC: this.oneinchSwapProvider,
        ETH: this.oneinchSwapProvider,
        BNB: this.oneinchSwapProvider,
        RBTC: this.sovrynSwapProvider,
        AVAX: this.oneinchSwapProvider,
        UST: this.astroportSwapProvider,
        LUNA: this.astroportSwapProvider
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
    if (isERC20(from) || !isERC20(to) || amount <= 0) return null
    const bridgeAsset = getNativeAsset(to)
    if (!this.supportedBridgeAssets.includes(bridgeAsset)) return null
    const quote = await this.liqualitySwapProvider.getQuote({
      network,
      from,
      to: bridgeAsset,
      amount
    })
    if (!quote) return null
    const bridgeAssetQuantity = unitToCurrency(assets[bridgeAsset], quote.toAmount)
    const finalQuote = await this.bridgeAssetToAutomatedMarketMaker[bridgeAsset].getQuote({
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
      path: finalQuote.path,
      fromTokenAddress: finalQuote.fromTokenAddress // for Terra ERC20
    }
  }

  async newSwap({ network, walletId, quote: _quote }) {
    const result = await this.liqualitySwapProvider.newSwap({
      network,
      walletId,
      quote: this.swapLiqualityFormat(_quote)
    })
    return {
      ...result,
      ..._quote,
      slippage: slippagePercentage * 100,
      bridgeAssetAmount: result.toAmount
    }
  }

  async updateOrder(order) {
    return await this.liqualitySwapProvider.updateOrder(order)
  }

  async estimateFees({ network, walletId, asset, txType, quote, feePrices, max }) {
    const input = { network, walletId, asset, txType, quote, feePrices, max }

    if (txType === this.fromTxType) {
      // swap initiation fee
      const liqualityFees = await this.liqualitySwapProvider.estimateFees({
        ...input,
        txType: LiqualitySwapProvider.fromTxType,
        quote: this.swapLiqualityFormat(quote)
      })

      return liqualityFees
    }

    if (txType === this.toTxType) {
      // swap claim fee
      const liqualityFees = await this.liqualitySwapProvider.estimateFees({
        ...input,
        asset: quote.bridgeAsset,
        txType: LiqualitySwapProvider.toTxType,
        quote: this.swapLiqualityFormat(quote)
      })

      // amm fee
      const automatedMarketMakerFees = await this.bridgeAssetToAutomatedMarketMaker[
        quote.bridgeAsset
      ].estimateFees({
        ...input,
        asset: quote.bridgeAsset,
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
  }

  async finalizeLiqualitySwapAndStartAutomatedMarketMaker({ swap, network, walletId }) {
    const result = await this.liqualitySwapProvider.waitForClaimConfirmations({
      swap,
      network,
      walletId
    })
    if (result?.status === 'SUCCESS') return { endTime: Date.now(), status: 'APPROVE_CONFIRMED' }
  }

  async performNextSwapAction(store, { network, walletId, swap }) {
    let updates

    if (swap.status === 'WAITING_FOR_CLAIM_CONFIRMATIONS') {
      updates = await withInterval(async () =>
        this.finalizeLiqualitySwapAndStartAutomatedMarketMaker({
          swap: this.swapLiqualityFormat(swap),
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

    if (!updates) {
      updates = await this.bridgeAssetToAutomatedMarketMaker[
        swap.bridgeAsset
      ].performNextSwapAction(store, {
        network,
        walletId,
        swap: this.swapAutomatedMarketMakerFormat(swap)
      })
    }
    return updates
  }

  swapLiqualityFormat = (swap) => {
    return {
      ...swap,
      to: swap.bridgeAsset,
      toAmount: swap.bridgeAssetAmount,
      slippagePercentage
    }
  }

  swapAutomatedMarketMakerFormat = (swap) => {
    return {
      ...swap,
      from: swap.bridgeAsset,
      fromAmount: swap.bridgeAssetAmount,
      fromAccountId: swap.toAccountId, // AMM swaps happen on the same account
      slippagePercentage,
      fee: swap.claimFee
    }
  }

  static txTypes = {
    FROM_CHAIN: 'FROM_CHAIN',
    TO_CHAIN: 'TO_CHAIN'
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
      notification(swap) {
        return {
          message: `Counterparty sent ${prettyBalance(swap.bridgeAssetAmount, swap.bridgeAsset)} ${
            swap.bridgeAsset
          } to escrow`
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
      notification() {
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

  static fromTxType = LiqualityBoostNativeToERC20.txTypes.FROM_CHAIN
  static toTxType = LiqualityBoostNativeToERC20.txTypes.TO_CHAIN

  static timelineDiagramSteps = ['INITIATION', 'AGENT_INITIATION', 'CLAIM_OR_REFUND', 'SWAP']

  static totalSteps = 5
}

export { LiqualityBoostNativeToERC20 }
