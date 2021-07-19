import axios from 'axios'
import BN from 'bignumber.js'
import { SwapProvider } from '../SwapProvider'
import { v4 as uuidv4 } from 'uuid'
import { chains, assets, currencyToUnit } from '@liquality/cryptoassets'
import { ChainNetworks } from '../../store/utils'
import { withLock, withInterval } from '../../store/actions/performNextAction/utils'
import { prettyBalance } from '../../utils/coinFormatter'
import { isEthereumChain, isERC20 } from '@/utils/asset'
import cryptoassets from '@/utils/cryptoassets'
import * as ethers from 'ethers'
import buildConfig from '../../build.config'
import ERC20 from '@uniswap/v2-core/build/ERC20.json'
import { getTxFee } from '../../utils/fees'

const nativeAssetAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const slippagePercentage = 0.5
const chainToRpcProviders = {
  1: `https://mainnet.infura.io/v3/${buildConfig.infuraApiKey}`,
  56: 'https://bsc-dataseed.binance.org',
  137: 'https://rpc-mainnet.matic.network'
}

class OneinchSwapProvider extends SwapProvider {
  async getSupportedPairs () {
    return []
  }

  async _getQuote (chainIdFrom, fromToken, toToken, amount) {
    return (await axios({
      url: this.config.agent + `/${chainIdFrom}/quote`,
      method: 'get',
      params: { fromTokenAddress: fromToken || nativeAssetAddress, toTokenAddress: toToken || nativeAssetAddress, amount }
    }))
  }

  async getQuote ({ network, from, to, amount }) {
    if (!isEthereumChain(from) || !isEthereumChain(to) || amount <= 0) return null
    const fromAmountInUnit = BN(currencyToUnit(cryptoassets[from], BN(amount)))
    const chainIdFrom = ChainNetworks[cryptoassets[from].chain][network].chainId
    const chainIdTo = ChainNetworks[cryptoassets[to].chain][network].chainId
    if (chainIdFrom !== chainIdTo || !chainToRpcProviders[chainIdFrom]) return null

    const trade = await this._getQuote(chainIdFrom, assets[from].contractAddress, assets[to].contractAddress, fromAmountInUnit.toNumber())
    const toAmountInUnit = BN(trade.data.toTokenAmount)
    return {
      from,
      to,
      // TODO: Amounts should be in BigNumber to prevent loss of precision
      fromAmount: fromAmountInUnit.toNumber(),
      toAmount: toAmountInUnit.toNumber()
    }
  }

  async approveTokens ({ network, walletId, quote }) {
    const fromChain = cryptoassets[quote.from].chain
    const toChain = cryptoassets[quote.to].chain
    const chainId = ChainNetworks[fromChain][network].chainId
    if (fromChain !== toChain || !chainToRpcProviders[chainId]) return null

    const api = new ethers.providers.StaticJsonRpcProvider(chainToRpcProviders[chainId])
    const erc20 = new ethers.Contract(cryptoassets[quote.from].contractAddress, ERC20.abi, api)
    const fromAddressRaw = await this.getSwapAddress(network, walletId, quote.from, quote.toAccountId)
    const fromAddress = chains[fromChain].formatAddress(fromAddressRaw)
    const allowance = await erc20.allowance(fromAddress, this.config.routerAddress)
    const inputAmount = ethers.BigNumber.from(BN(quote.fromAmount).toFixed())
    if (allowance.gte(inputAmount)) {
      return {
        status: 'APPROVE_CONFIRMED'
      }
    }

    const callData = await axios({
      url: this.config.agent + `/${chainId}/approve/calldata`,
      method: 'get',
      params: { tokenAddress: cryptoassets[quote.from].contractAddress, amount: inputAmount }
    })

    const account = this.getAccount(quote.fromAccountId)
    const client = this.getClient(network, walletId, quote.from, account?.type)
    const approveTx = await client.chain.sendTransaction({ to: callData.data?.to, value: callData.data?.value, data: callData.data?.data, fee: quote.fee })

    return {
      status: 'WAITING_FOR_APPROVE_CONFIRMATIONS',
      approveTx,
      approveTxHash: approveTx.hash
    }
  }

  async sendSwap ({ network, walletId, quote }) {
    const toChain = cryptoassets[quote.to].chain
    const fromChain = cryptoassets[quote.from].chain
    const chainId = ChainNetworks[toChain][network].chainId
    if (toChain !== fromChain || !chainToRpcProviders[chainId]) return null

    const account = this.getAccount(quote.fromAccountId)
    const client = this.getClient(network, walletId, quote.from, account?.type)
    const fromAddressRaw = await this.getSwapAddress(network, walletId, quote.from, quote.fromAccountId)
    const fromAddress = chains[toChain].formatAddress(fromAddressRaw)

    const trade = await axios({
      url: this.config.agent + `/${chainId}/swap`,
      method: 'get',
      params: { fromTokenAddress: assets[quote.from].contractAddress || nativeAssetAddress, toTokenAddress: assets[quote.to].contractAddress || nativeAssetAddress, amount: quote.fromAmount, fromAddress: fromAddress, slippage: slippagePercentage }
    })

    if (BN(quote.toAmount).times(1 - slippagePercentage / 100).gt(trade.data.toTokenAmount)) {
      throw new Error(`Slippage is too high. You expect ${quote.toAmount} but you are going to receive ${trade.data.toTokenAmount} ${quote.to}`)
    }

    await this.sendLedgerNotification(quote, account, 'Signing required to complete the swap.')
    const swapTx = await client.chain.sendTransaction({ to: trade.data.tx?.to, value: trade.data.tx?.value, data: trade.data.tx?.data, fee: quote.fee })
    return {
      status: 'WAITING_FOR_SWAP_CONFIRMATIONS',
      swapTx,
      swapTxHash: swapTx.hash
    }
  }

  async newSwap ({ network, walletId, quote }) {
    const approvalRequired = isERC20(quote.from)
    const updates = approvalRequired
      ? await this.approveTokens({ network, walletId, quote })
      : await this.sendSwap({ network, walletId, quote })

    return {
      id: uuidv4(),
      fee: quote.fee,
      slippage: 50,
      ...updates
    }
  }

  async estimateFees ({ network, walletId, asset, accountId, txType, quote, feePrices, max }) {
    const toChain = cryptoassets[quote.to].chain
    const chainId = ChainNetworks[toChain][network].chainId
    if (txType in OneinchSwapProvider.txTypes) {
      const fees = {}
      const tradeData = await this._getQuote(chainId, assets[quote.from].contractAddress, assets[quote.to].contractAddress, quote.fromAmount)
      for (const feePrice of feePrices) {
        fees[feePrice] = getTxFee(
          OneinchSwapProvider.supportedAssets.reduce((o, key) => Object.assign(o, { [key]: BN(tradeData.data?.estimatedGas).times(1.5) }), {}),
          asset,
          feePrice)
      }
      return fees
    }
  }

  async waitForApproveConfirmations ({ swap, network, walletId }) {
    const account = this.getAccount(swap.accountId)
    const client = this.getClient(network, walletId, swap.from, account?.type)

    try {
      const tx = await client.chain.getTransactionByHash(swap.approveTxHash)
      if (tx && tx.confirmations > 0) {
        return {
          endTime: Date.now(),
          status: 'APPROVE_CONFIRMED'
        }
      }
    } catch (e) {
      if (e.name === 'TxNotFoundError') console.warn(e)
      else throw e
    }
  }

  async waitForSwapConfirmations ({ swap, network, walletId }) {
    const account = this.getAccount(swap.accountId)
    const client = this.getClient(network, walletId, swap.from, account?.type)

    try {
      const tx = await client.chain.getTransactionByHash(swap.swapTxHash)
      if (tx && tx.confirmations > 0) {
        this.updateBalances({ network, walletId, assets: [swap.from] })
        return {
          endTime: Date.now(),
          status: 'SUCCESS'
        }
      }
    } catch (e) {
      if (e.name === 'TxNotFoundError') console.warn(e)
      else throw e
    }
  }

  async performNextSwapAction (store, { network, walletId, swap }) {
    let updates

    switch (swap.status) {
      case 'WAITING_FOR_APPROVE_CONFIRMATIONS':
        updates = await withInterval(async () => this.waitForApproveConfirmations({ swap, network, walletId }))
        break
      case 'APPROVE_CONFIRMED':
        updates = await withLock(store, { item: swap, network, walletId, asset: swap.from },
          async () => this.sendSwap({ quote: swap, network, walletId }))
        break
      case 'WAITING_FOR_SWAP_CONFIRMATIONS':
        updates = await withInterval(async () => this.waitForSwapConfirmations({ swap, network, walletId }))
        break
    }

    return updates
  }

  static txTypes = {
    SWAP: 'SWAP'
  }

  static supportedAssets = ['ETH', 'BNB', 'MATIC', 'ERC20']

  static statuses = {
    WAITING_FOR_APPROVE_CONFIRMATIONS: {
      step: 0,
      label: 'Approving {from}',
      filterStatus: 'PENDING',
      notification (swap) {
        return {
          message: `Approving ${swap.from}`
        }
      }
    },
    APPROVE_CONFIRMED: {
      step: 1,
      label: 'Swapping {from}',
      filterStatus: 'PENDING'
    },
    WAITING_FOR_SWAP_CONFIRMATIONS: {
      step: 1,
      label: 'Swapping {from}',
      filterStatus: 'PENDING',
      notification () {
        return {
          message: 'Engaging oneinch'
        }
      }
    },
    SUCCESS: {
      step: 2,
      label: 'Completed',
      filterStatus: 'COMPLETED',
      notification (swap) {
        return {
          message: `Swap completed, ${prettyBalance(swap.toAmount, swap.to)} ${swap.to} ready to use`
        }
      }
    },
    FAILED: {
      step: 2,
      label: 'Swap Failed',
      filterStatus: 'REFUNDED',
      notification () {
        return {
          message: 'Swap failed'
        }
      }
    }
  }

  static fromTxType = OneinchSwapProvider.txTypes.SWAP
  static toTxType = null

  static totalSteps = 3
}

export { OneinchSwapProvider }
