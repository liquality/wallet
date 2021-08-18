import BN from 'bignumber.js'
import { SwapProvider } from '../SwapProvider'
import { unitToCurrency, assets } from '@liquality/cryptoassets'
import { sha256 } from '@liquality/crypto'
import { withLock, withInterval } from '../../store/actions/performNextAction/utils'
import { prettyBalance } from '../../utils/coinFormatter'
import { isERC20, getNativeAsset } from '@/utils/asset'
import { createSwapProvider } from '../../store/factory/swapProvider'

const slippagePercentage = 3

class LiqualityBoostSwapProvider extends SwapProvider {
  constructor (config) {
    super(config)
    this.liqualitySwapProvider = createSwapProvider(this.config.network, 'liquality')
    this.oneinchSwapProvider = createSwapProvider(this.config.network, 'oneinchV3')
  }

  async getSupportedPairs () {
    return []
  }

  async getQuote ({ network, from, to, amount }) {
    if (isERC20(from) || !isERC20(to) || amount <= 0) return null
    const toNativeAsset = getNativeAsset(to)
    const quote = await this.liqualitySwapProvider.getQuote({ network, from, to: toNativeAsset, amount })
    if (!quote) return null
    const toNativeAssetQuantity = unitToCurrency(assets[toNativeAsset], quote.toAmount)
    const finalQuote = await this.oneinchSwapProvider.getQuote({ network, from: toNativeAsset, to, amount: toNativeAssetQuantity.toNumber() })
    if (!finalQuote) return null
    return {
      from,
      to,
      fromAmount: quote.fromAmount,
      toAmount: finalQuote.toAmount,
      toNativeAsset,
      toNativeAssetAmount: quote.toAmount
    }
  }

  async newSwap ({ network, walletId, quote: _quote }) {
    const lockedQuote = await this.liqualitySwapProvider._getQuote({ from: _quote.from, to: _quote.toNativeAsset, amount: _quote.fromAmount })
    const quote = {
      ...lockedQuote,
      ..._quote,
      toNativeAssetAmount: lockedQuote.toAmount
    }
    if (await this.liqualitySwapProvider.hasQuoteExpired({ network, walletId, swap: quote })) {
      throw new Error('The quote is expired.')
    }

    quote.fromAddress = await this.getSwapAddress(network, walletId, quote.from, quote.fromAccountId)
    quote.toAddress = await this.getSwapAddress(network, walletId, quote.toNativeAsset, quote.toAccountId)
    const fromClient = this.getClient(network, walletId, quote.from, quote.fromAccountId)

    const message = [
      'Creating a swap with following terms:',
      `Send: ${quote.fromAmount} (lowest denomination) ${quote.from}`,
      `Receive: ${quote.toAmount} (lowest denomination) ${quote.to}`,
      `My ${quote.from} Address: ${quote.fromAddress}`,
      `My ${quote.to} Address: ${quote.toAddress}`,
      `Counterparty ${quote.from} Address: ${quote.fromCounterPartyAddress}`,
      `Counterparty ${quote.to} Address: ${quote.toCounterPartyAddress}`,
      `Timestamp: ${quote.swapExpiration}`
    ].join('\n')

    const messageHex = Buffer.from(message, 'utf8').toString('hex')
    const secret = await fromClient.swap.generateSecret(messageHex)
    const secretHash = sha256(secret)

    const fromFundTx = await fromClient.swap.initiateSwap(
      {
        value: BN(quote.fromAmount),
        recipientAddress: quote.fromCounterPartyAddress,
        refundAddress: quote.fromAddress,
        secretHash: secretHash,
        expiration: quote.swapExpiration
      },
      quote.fee
    )

    return {
      ...quote,
      status: 'INITIATED',
      secret,
      secretHash,
      fromFundHash: fromFundTx.hash,
      fromFundTx,
      slippage: slippagePercentage * 100
    }
  }

  async estimateFees ({ network, walletId, asset, txType, quote, feePrices, max }) {
    const liqualityFees = await this.liqualitySwapProvider.estimateFees({ network, walletId, asset, txType, quote: { ...quote, to: quote.toNativeAsset, toAmount: quote.toNativeAssetAmount }, feePrices, max })
    if (isERC20(asset) && txType === LiqualityBoostSwapProvider.txTypes.SWAP_CLAIM) {
      const oneinchFees = await this.oneinchSwapProvider.estimateFees({ network, walletId, asset, txType: LiqualityBoostSwapProvider.txTypes.SWAP, quote: { ...quote, from: quote.toNativeAsset, fromAmount: quote.toNativeAssetAmount, fromAccountId: quote.toAccountId, slippagePercentage }, feePrices, max })
      const totalFees = {}
      for (const key in oneinchFees) {
        totalFees[key] = BN(oneinchFees[key]).plus(liqualityFees[key])
      }
      return totalFees
    }
    return liqualityFees
  }

  async finalizeLiqualitySwapAndStartOneinch ({ swap, network, walletId }) {
    const result = await this.liqualitySwapProvider.waitForClaimConfirmations({ swap, network, walletId })
    if (result?.status === 'SUCCESS') return { endTime: Date.now(), status: 'SEND_ONEINCH_SWAP' }
  }

  async performNextSwapAction (store, { network, walletId, swap }) {
    let updates
    const swapLiqualityFormat = { ...swap, to: swap.toNativeAsset, toAmount: swap.toNativeAssetAmount, slippagePercentage }
    const swapOneInchFormat = { ...swap, from: swap.toNativeAsset, fromAmount: swap.toNativeAssetAmount, fromAccountId: swap.toAccountId, slippagePercentage }
    switch (swap.status) {
      case 'INITIATED':
        updates = await this.liqualitySwapProvider.reportInitiation({ swap: swapLiqualityFormat, network, walletId })
        break

      case 'INITIATION_REPORTED':
        updates = await withInterval(async () => this.liqualitySwapProvider.confirmInitiation({ swap: swapLiqualityFormat, network, walletId }))
        break

      case 'INITIATION_CONFIRMED':
        updates = await withLock(store, { item: swap, network, walletId, asset: swap.from },
          async () => this.liqualitySwapProvider.fundSwap({ swap: swapLiqualityFormat, network, walletId }))
        break

      case 'FUNDED':
        updates = await withInterval(async () => this.liqualitySwapProvider.findCounterPartyInitiation({ swap: swapLiqualityFormat, network, walletId }))
        break

      case 'CONFIRM_COUNTER_PARTY_INITIATION':
        updates = await withInterval(async () => this.liqualitySwapProvider.confirmCounterPartyInitiation({ swap: swapLiqualityFormat, network, walletId }))
        break

      case 'READY_TO_CLAIM':
        updates = await withLock(store, { item: swap, network, walletId, asset: swap.to },
          async () => this.liqualitySwapProvider.claimSwap({ swap: swapLiqualityFormat, network, walletId }))
        break

      case 'WAITING_FOR_CLAIM_CONFIRMATIONS':
        updates = await withInterval(async () => this.finalizeLiqualitySwapAndStartOneinch({ swap: swapLiqualityFormat, network, walletId }))
        break

      case 'WAITING_FOR_REFUND':
        updates = await withInterval(async () => this.liqualitySwapProvider.waitForRefund({ swap: swapLiqualityFormat, network, walletId }))
        break

      case 'GET_REFUND':
        updates = await withLock(store, { item: swap, network, walletId, asset: swap.from },
          async () => this.liqualitySwapProvider.refundSwap({ swap: swapLiqualityFormat, network, walletId }))
        break

      case 'WAITING_FOR_REFUND_CONFIRMATIONS':
        updates = await withInterval(async () => this.liqualitySwapProvider.waitForRefundConfirmations({ swap: swapLiqualityFormat, network, walletId }))
        break
      case 'SEND_ONEINCH_SWAP':
        updates = await withLock(store, { item: swap, network, walletId, asset: swap.from },
          async () => this.oneinchSwapProvider.sendSwap({ quote: swapOneInchFormat, network, walletId }))
        break
      case 'WAITING_FOR_SWAP_CONFIRMATIONS':
        updates = await withInterval(async () => this.oneinchSwapProvider.waitForSwapConfirmations({ swap: swapOneInchFormat, network, walletId }))
        break
    }

    return updates
  }

  static txTypes = {
    SWAP_INITIATION: 'SWAP_INITIATION',
    SWAP_CLAIM: 'SWAP_CLAIM',
    SWAP: 'SWAP'
  }

  static statuses = {
    INITIATED: {
      step: 0,
      label: 'Locking {from}',
      filterStatus: 'PENDING'
    },
    INITIATION_REPORTED: {
      step: 0,
      label: 'Locking {from}',
      filterStatus: 'PENDING',
      notification () {
        return {
          message: 'Swap initiated'
        }
      }
    },
    INITIATION_CONFIRMED: {
      step: 0,
      label: 'Locking {from}',
      filterStatus: 'PENDING'
    },
    FUNDED: {
      step: 1,
      label: 'Locking {toNativeAsset}',
      filterStatus: 'PENDING'
    },
    CONFIRM_COUNTER_PARTY_INITIATION: {
      step: 1,
      label: 'Locking {toNativeAsset}',
      filterStatus: 'PENDING',
      notification (swap) {
        return {
          message: `Counterparty sent ${prettyBalance(swap.toAmount, swap.to)} ${swap.to} to escrow`
        }
      }
    },
    READY_TO_CLAIM: {
      step: 2,
      label: 'Claiming {toNativeAsset}',
      filterStatus: 'PENDING',
      notification () {
        return {
          message: 'Claiming funds'
        }
      }
    },
    WAITING_FOR_CLAIM_CONFIRMATIONS: {
      step: 2,
      label: 'Claiming {toNativeAsset}',
      filterStatus: 'PENDING'
    },
    WAITING_FOR_REFUND: {
      step: 2,
      label: 'Pending Refund',
      filterStatus: 'PENDING'
    },
    GET_REFUND: {
      step: 2,
      label: 'Refunding {from}',
      filterStatus: 'PENDING'
    },
    WAITING_FOR_REFUND_CONFIRMATIONS: {
      step: 2,
      label: 'Refunding {from}',
      filterStatus: 'PENDING'
    },
    REFUNDED: {
      step: 3,
      label: 'Refunded',
      filterStatus: 'REFUNDED',
      notification (swap) {
        return {
          message: `Swap refunded, ${prettyBalance(swap.fromAmount, swap.from)} ${swap.from} returned`
        }
      }
    },
    SEND_ONEINCH_SWAP: {
      step: 4,
      label: 'Swapping {toNativeAsset} for {to}',
      filterStatus: 'PENDING'
    },
    WAITING_FOR_SWAP_CONFIRMATIONS: {
      step: 4,
      label: 'Waiting Swap Confirmation {to}',
      filterStatus: 'PENDING',
      notification () {
        return {
          message: 'Engaging oneinch'
        }
      }
    },
    SUCCESS: {
      step: 5,
      label: 'Completed',
      filterStatus: 'COMPLETED',
      notification (swap) {
        return {
          message: `Swap completed, ${prettyBalance(swap.toAmount, swap.to)} ${swap.to} ready to use`
        }
      }
    },
    QUOTE_EXPIRED: {
      step: 5,
      label: 'Quote Expired',
      filterStatus: 'REFUNDED'
    }
  }

  static fromTxType = LiqualityBoostSwapProvider.txTypes.SWAP_INITIATION
  static toTxType = LiqualityBoostSwapProvider.txTypes.SWAP_CLAIM

  static totalSteps = 5
}

export { LiqualityBoostSwapProvider }
