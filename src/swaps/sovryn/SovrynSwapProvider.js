import BN from 'bignumber.js'
// import JSBI from 'jsbi'
// import { v4 as uuidv4 } from 'uuid'

// import { Token, WETH9, CurrencyAmount, TradeType, Fraction, Percent } from '@uniswap/sdk-core'
// import { Route, Trade, Pair } from '@uniswap/v2-sdk'
// import ERC20 from '@uniswap/v2-core/build/ERC20.json'
// import UniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'
// import UniswapV2Router from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import * as ethers from 'ethers'

// import buildConfig from '../../build.config'
// import { chains, currencyToUnit, unitToCurrency } from '@liquality/cryptoassets'
// import cryptoassets from '@/utils/cryptoassets'
// import { isEthereumChain, isERC20 } from '../../utils/asset'
// import { prettyBalance } from '../../utils/coinFormatter'
// import { ChainNetworks } from '../../store/utils'
// import { withInterval, withLock } from '../../store/actions/performNextAction/utils'
// import { SwapProvider } from '../SwapProvider'

import { currencyToUnit } from '@liquality/cryptoassets'
import cryptoassets from '@/utils/cryptoassets'
import { ChainNetworks } from '../../store/utils'
import { SwapProvider } from '../SwapProvider'

import SovrynSwapNetworkABI from './abiSovrynSwapNetwork'
// import RBTCWrapperProxyABI from './abiRBTCWrapperProxy'

// TODO: swap endline???
// const SWAP_DEADLINE = 30 * 60 // 30 minutes

// use WRBTC address for RBTC native token
const nativeAssetAddress = {
  mainnet: '0x542fDA317318eBF1d3DEAf76E0b632741A7e677d',
  testnet: '0x69FE5cEC81D5eF92600c1A0dB1F11986AB3758Ab'
}

class SovrynSwapProvider extends SwapProvider {
  constructor (config) {
    super(config)
    this._apiCache = {} // chainId to RPC provider
  }

  async getSupportedPairs () {
    return []
  }

  getApi (network, asset) {
    const chain = cryptoassets[asset].chain
    const chainId = ChainNetworks[chain][network].chainId
    if (chainId in this._apiCache) {
      return this._apiCache[chainId]
    } else {
      const api = new ethers.providers.StaticJsonRpcProvider(this.config.rpcURL)
      this._apiCache[chainId] = api
      return api
    }
  }

  // TODO: configurable slippage?
  // getMinimumOutput (outputAmount) {
  //   // const slippageTolerance = new Percent('50', '10000') // 0.5%
  //   // const slippageAdjustedAmountOut = new Fraction(JSBI.BigInt(1))
  //   //   .add(slippageTolerance)
  //   //   .invert()
  //   //   .multiply(outputAmount.quotient).quotient
  //   // return CurrencyAmount.fromRawAmount(outputAmount.currency, slippageAdjustedAmountOut)
  // }

  // let rate
  // if (fromInfo.type === 'native' || toInfo.type === 'native') { // use routerAddressRBTC when native token is present in the swap
  //   const wpContract = new ethers.Contract(this.config.routerAddressRBTC.toLowerCase(), RBTCWrapperProxyABI, this.getApi(network, from))
  //   rate = wpContract.rateByPath(path, fromAmountInUnit)
  // } else {
  //   rate = ssnContract.rateByPath(path, fromAmountInUnit)
  // }

  // returns rates between tokens
  async getQuote ({ network, from, to, amount }) {
    console.log('getQuote --> ', network, from, to, amount)

    const fromInfo = cryptoassets[from]
    const toInfo = cryptoassets[to]

    // only RSK network swaps
    if (fromInfo.chain !== 'rsk' || toInfo.chain !== 'rsk' || amount < 0) return null

    const fromAddress = (fromInfo.contractAddress || nativeAssetAddress[network]).toLowerCase()
    const toAddress = (toInfo.contractAddress || nativeAssetAddress[network]).toLowerCase()
    const fromAmountInUnit = currencyToUnit(fromInfo, BN(amount))

    const ssnContract = new ethers.Contract(this.config.routerAddress.toLowerCase(), SovrynSwapNetworkABI, this.getApi(network, from))

    // generate path
    const pathFromTo = await ssnContract.conversionPath(fromAddress, toAddress)
    const pathToFrom = [].concat(pathFromTo).reverse()

    // calculate rates
    const rateFromTo = await ssnContract.rateByPath(pathFromTo, fromAmountInUnit.toString(10))
    const rateToFrom = await ssnContract.rateByPath(pathToFrom, rateFromTo.toString(10))

    return {
      from,
      to,
      fromAmount: rateToFrom.toString(10),
      toAmount: rateFromTo.toString(10)
    }
  }

  async requiresApproval ({ network, walletId, quote }) {
    // if (!isERC20(quote.from)) return false

    // const fromChain = cryptoassets[quote.from].chain
    // const api = this.getApi(network, quote.from)
    // const erc20 = new ethers.Contract(cryptoassets[quote.from].contractAddress, ERC20.abi, api)

    // const fromAddressRaw = await this.getSwapAddress(network, walletId, quote.from, quote.fromAccountId)
    // const fromAddress = chains[fromChain].formatAddress(fromAddressRaw)
    // const allowance = await erc20.allowance(fromAddress, this.config.routerAddress)
    // const inputAmount = ethers.BigNumber.from(BN(quote.fromAmount).toFixed())
    // if (allowance.gte(inputAmount)) {
    //   return false
    // }
  }

  async buildApprovalTx ({ network, walletId, quote }) {
    // const api = this.getApi(network, quote.from)
    // const erc20 = new ethers.Contract(cryptoassets[quote.from].contractAddress, ERC20.abi, api)

    // const inputAmount = ethers.BigNumber.from(BN(quote.fromAmount).toFixed())
    // const inputAmountHex = inputAmount.toHexString()
    // const encodedData = erc20.interface.encodeFunctionData('approve', [this.config.routerAddress, inputAmountHex])

    // const fromChain = cryptoassets[quote.from].chain
    // const fromAddressRaw = await this.getSwapAddress(network, walletId, quote.from, quote.fromAccountId)
    // const fromAddress = chains[fromChain].formatAddress(fromAddressRaw)

    // return {
    //   from: fromAddress, // Required for estimation only (not used in chain client)
    //   to: cryptoassets[quote.from].contractAddress,
    //   value: 0,
    //   data: encodedData,
    //   fee: quote.fee
    // }
  }

  async approveTokens ({ network, walletId, quote }) {
    // const requiresApproval = await this.requiresApproval({ network, walletId, quote })
    // if (!requiresApproval) {
    //   return {
    //     status: 'APPROVE_CONFIRMED'
    //   }
    // }

    // const txData = await this.buildApprovalTx({ network, walletId, quote })

    // const client = this.getClient(network, walletId, quote.from, quote.fromAccountId)
    // const approveTx = await client.chain.sendTransaction(txData)

    // return {
    //   status: 'WAITING_FOR_APPROVE_CONFIRMATIONS',
    //   approveTx,
    //   approveTxHash: approveTx.hash
    // }
  }

  async buildSwapTx ({ network, walletId, quote }) {
    // const toChain = cryptoassets[quote.to].chain
    // const chainId = ChainNetworks[toChain][network].chainId

    // const fromToken = this.getUniswapToken(chainId, quote.from)
    // const toToken = this.getUniswapToken(chainId, quote.to)

    // const outputAmount = CurrencyAmount.fromRawAmount(toToken, BN(quote.toAmount).toFixed())
    // const minimumOutput = this.getMinimumOutput(outputAmount)

    // const client = this.getClient(network, walletId, quote.from, quote.fromAccountId)
    // const blockHeight = await client.chain.getBlockHeight()
    // const currentBlock = await client.chain.getBlockByNumber(blockHeight)

    // const path = [fromToken.address, toToken.address]
    // const deadline = currentBlock.timestamp + SWAP_DEADLINE
    // const minimumOutputInUnit = currencyToUnit(cryptoassets[quote.to], BN(minimumOutput.toExact()))
    // const inputAmountHex = ethers.BigNumber.from(BN(quote.fromAmount).toFixed()).toHexString()
    // const outputAmountHex = ethers.BigNumber.from(minimumOutputInUnit.toFixed()).toHexString()

    // const toAddressRaw = await this.getSwapAddress(network, walletId, quote.to, quote.toAccountId)
    // const toAddress = chains[toChain].formatAddress(toAddressRaw)

    // const api = this.getApi(network, quote.to)
    // const uniswap = new ethers.Contract(this.config.routerAddress, UniswapV2Router.abi, api)

    // let encodedData
    // if (isERC20(quote.from)) {
    //   const swapTokensMethod = isERC20(quote.to) ? 'swapExactTokensForTokens' : 'swapExactTokensForETH'
    //   encodedData = uniswap.interface.encodeFunctionData(swapTokensMethod, [
    //     inputAmountHex, outputAmountHex, path, toAddress, deadline
    //   ])
    // } else {
    //   encodedData = uniswap.interface.encodeFunctionData('swapExactETHForTokens', [
    //     outputAmountHex, path, toAddress, deadline
    //   ])
    // }

    // const value = isERC20(quote.from) ? 0 : BN(quote.fromAmount)

    // const fromChain = cryptoassets[quote.from].chain
    // const fromAddressRaw = await this.getSwapAddress(network, walletId, quote.from, quote.fromAccountId)
    // const fromAddress = chains[fromChain].formatAddress(fromAddressRaw)

    // return {
    //   from: fromAddress, // Required for estimation only (not used in chain client)
    //   to: this.config.routerAddress,
    //   value,
    //   data: encodedData,
    //   fee: quote.fee
    // }
  }

  async sendSwap ({ network, walletId, quote }) {
    // const txData = await this.buildSwapTx({ network, walletId, quote })
    // const client = this.getClient(network, walletId, quote.from, quote.fromAccountId)

    // await this.sendLedgerNotification(quote.fromAccountId, 'Signing required to complete the swap.')
    // const swapTx = await client.chain.sendTransaction(txData)

    // return {
    //   status: 'WAITING_FOR_SWAP_CONFIRMATIONS',
    //   swapTx,
    //   swapTxHash: swapTx.hash
    // }
  }

  async newSwap ({ network, walletId, quote }) {
    // const approvalRequired = isERC20(quote.from)
    // const updates = approvalRequired
    //   ? await this.approveTokens({ network, walletId, quote })
    //   : await this.sendSwap({ network, walletId, quote })

    // return {
    //   id: uuidv4(),
    //   fee: quote.fee,
    //   slippage: 50,
    //   ...updates
    // }
  }

  async estimateFees ({ network, walletId, asset, txType, quote, feePrices, max }) {
    // if (txType !== UniswapSwapProvider.fromTxType) throw new Error(`Invalid tx type ${txType}`)

    // const nativeAsset = chains[cryptoassets[asset].chain].nativeAsset
    // const account = this.getAccount(quote.fromAccountId)
    // const client = this.getClient(network, walletId, quote.from, account?.type)

    // let gasLimit = 0
    // if (await this.requiresApproval({ network, walletId, quote })) {
    //   const approvalTx = await this.buildApprovalTx({ network, walletId, quote })
    //   const rawApprovalTx = {
    //     from: approvalTx.from,
    //     to: approvalTx.to,
    //     data: approvalTx.data,
    //     value: '0x' + approvalTx.value.toString(16)
    //   }

    //   gasLimit += await client.getMethod('estimateGas')(rawApprovalTx)
    // }

    // const swapTx = await this.buildSwapTx({ network, walletId, quote })
    // const rawSwapTx = {
    //   from: swapTx.from,
    //   to: swapTx.to,
    //   data: swapTx.data,
    //   value: '0x' + swapTx.value.toString(16)
    // }
    // gasLimit += await client.getMethod('estimateGas')(rawSwapTx)

    // const fees = {}
    // for (const feePrice of feePrices) {
    //   const gasPrice = BN(feePrice).times(1e9) // ETH fee price is in gwei
    //   const fee = BN(gasLimit).times(1.1).times(gasPrice)
    //   fees[feePrice] = unitToCurrency(cryptoassets[nativeAsset], fee)
    // }
    // return fees
  }

  async waitForApproveConfirmations ({ swap, network, walletId }) {
    // const client = this.getClient(network, walletId, swap.from, swap.fromAccountId)

    // try {
    //   const tx = await client.chain.getTransactionByHash(swap.approveTxHash)
    //   if (tx && tx.confirmations > 0) {
    //     return {
    //       endTime: Date.now(),
    //       status: 'APPROVE_CONFIRMED'
    //     }
    //   }
    // } catch (e) {
    //   if (e.name === 'TxNotFoundError') console.warn(e)
    //   else throw e
    // }
  }

  async waitForSwapConfirmations ({ swap, network, walletId }) {
    // const client = this.getClient(network, walletId, swap.from, swap.fromAccountId)

    // try {
    //   const tx = await client.chain.getTransactionByHash(swap.swapTxHash)
    //   if (tx && tx.confirmations > 0) {
    //     this.updateBalances({ network, walletId, assets: [swap.from] })
    //     return {
    //       endTime: Date.now(),
    //       status: 'SUCCESS'
    //     }
    //   }
    // } catch (e) {
    //   if (e.name === 'TxNotFoundError') console.warn(e)
    //   else throw e
    // }
  }

  async performNextSwapAction (store, { network, walletId, swap }) {
    // let updates

    // switch (swap.status) {
    //   case 'WAITING_FOR_APPROVE_CONFIRMATIONS':
    //     updates = await withInterval(async () => this.waitForApproveConfirmations({ swap, network, walletId }))
    //     break
    //   case 'APPROVE_CONFIRMED':
    //     updates = await withLock(store, { item: swap, network, walletId, asset: swap.from },
    //       async () => this.sendSwap({ quote: swap, network, walletId }))
    //     break
    //   case 'WAITING_FOR_SWAP_CONFIRMATIONS':
    //     updates = await withInterval(async () => this.waitForSwapConfirmations({ swap, network, walletId }))
    //     break
    // }

    // return updates
  }

  // static txTypes = {
  //   SWAP: 'SWAP'
  // }

  // static statuses = {
  //   WAITING_FOR_APPROVE_CONFIRMATIONS: {
  //     step: 0,
  //     label: 'Approving {from}',
  //     filterStatus: 'PENDING',
  //     notification (swap) {
  //       return {
  //         message: `Approving ${swap.from}`
  //       }
  //     }
  //   },
  //   APPROVE_CONFIRMED: {
  //     step: 1,
  //     label: 'Swapping {from}',
  //     filterStatus: 'PENDING'
  //   },
  //   WAITING_FOR_SWAP_CONFIRMATIONS: {
  //     step: 1,
  //     label: 'Swapping {from}',
  //     filterStatus: 'PENDING',
  //     notification () {
  //       return {
  //         message: 'Engaging the unicorn'
  //       }
  //     }
  //   },
  //   SUCCESS: {
  //     step: 2,
  //     label: 'Completed',
  //     filterStatus: 'COMPLETED',
  //     notification (swap) {
  //       return {
  //         message: `Swap completed, ${prettyBalance(swap.toAmount, swap.to)} ${swap.to} ready to use`
  //       }
  //     }
  //   },
  //   FAILED: {
  //     step: 2,
  //     label: 'Swap Failed',
  //     filterStatus: 'REFUNDED',
  //     notification () {
  //       return {
  //         message: 'Swap failed'
  //       }
  //     }
  //   }
  // }

  // static fromTxType = UniswapSwapProvider.txTypes.SWAP
  // static toTxType = null

  // static totalSteps = 3
}

export { SovrynSwapProvider }
