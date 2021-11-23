import BN from 'bignumber.js'
import { v4 as uuidv4 } from 'uuid'
import * as ethers from 'ethers'

import { chains, currencyToUnit, unitToCurrency } from '@liquality/cryptoassets'
import cryptoassets from '@/utils/cryptoassets'
import { isERC20 } from '../../utils/asset'
import { prettyBalance } from '../../utils/coinFormatter'
import { ChainNetworks } from '@/utils/networks'
import { withInterval, withLock } from '../../store/actions/performNextAction/utils'
import { SwapProvider } from '../SwapProvider'
import ERC20 from '@uniswap/v2-core/build/ERC20.json'

import { OriginsContractAddresses } from '@/build.config'
import controllerABI from './abi/controllerAbi.json'
import tokenABI from './abi/token.json'

class OriginsSwapProvider extends SwapProvider {
  constructor (config) {
    super(config)
    this._apiCache = {} // chainId to RPC provider
  }

  async getSupportedPairs () {
    return [{
      from: 'SOV',
      to: 'ZERO',
      rate: 100,
      max: currencyToUnit(cryptoassets.SOV, 100000).toFixed(),
      min: currencyToUnit(cryptoassets.SOV, 0).toFixed()
    }]
  }

  // returns rates between tokens
  async getQuote ({ network, from, to, amount }) {
    const fromInfo = cryptoassets[from]
    const toInfo = cryptoassets[to]

    // only RSK network swaps
    if (fromInfo.chain !== 'rsk' || toInfo.chain !== 'rsk' || amount <= 0) return null

    // calculate rates
    const rate = 100

    const fromAmountInUnit = currencyToUnit(fromInfo, BN(amount)).toFixed()
    const toAmountInUnit = BN(fromAmountInUnit).times(rate)

    return {
      from,
      to,
      fromAmount: fromAmountInUnit,
      toAmount: toAmountInUnit
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

  // ======== APPROVAL ========

  async requiresApproval ({ network, walletId, quote }) {
    if (!isERC20(quote.from)) return false

    const fromInfo = cryptoassets[quote.from]
    const toInfo = cryptoassets[quote.to]
    const erc20 = new ethers.Contract(fromInfo.contractAddress.toLowerCase(), ERC20.abi, this._getApi(network, quote.from))

    const fromAddressRaw = await this.getSwapAddress(network, walletId, quote.from, quote.fromAccountId)
    const fromAddress = chains[fromInfo.chain].formatAddress(fromAddressRaw, network)
    const spender = ((fromInfo.type === 'native' || toInfo.type === 'native') ? this.config.routerAddressRBTC : this.config.routerAddress).toLowerCase()
    const allowance = await erc20.allowance(fromAddress.toLowerCase(), spender)
    const inputAmount = ethers.BigNumber.from(BN(quote.fromAmount).toFixed())
    if (allowance.gte(inputAmount)) {
      return false
    }

    return true
  }

  async buildApprovalTx ({ network, walletId, quote }) {
    const fromInfo = cryptoassets[quote.from]
    const erc20 = new ethers.Contract(OriginsContractAddresses[network].ZERO_token, tokenABI, this._getApi(network, quote.from))

    const inputAmount = ethers.BigNumber.from(BN(quote.fromAmount).toFixed())
    const inputAmountHex = inputAmount.toHexString()
    // in case native token is involved -> give allowance to wrapper contract
    const spender = OriginsContractAddresses[network].ZERO_controller // ((fromInfo.type === 'native' || toInfo.type === 'native') ? this.config.routerAddressRBTC : this.config.routerAddress).toLowerCase()
    const encodedData = erc20.interface.encodeFunctionData('approve', [spender, inputAmountHex])

    const fromChain = fromInfo.chain
    const fromAddressRaw = await this.getSwapAddress(network, walletId, quote.from, quote.fromAccountId)
    const fromAddress = chains[fromChain].formatAddress(fromAddressRaw, network)

    return {
      from: fromAddress, // Required for estimation only (not used in chain client)
      to: fromInfo.contractAddress,
      value: 0,
      data: encodedData,
      fee: quote.fee
    }
  }

  async approveTokens ({ network, walletId, quote }) {
    const requiresApproval = await this.requiresApproval({ network, walletId, quote })
    if (!requiresApproval) {
      return {
        status: 'APPROVE_CONFIRMED'
      }
    }

    const txData = await this.buildApprovalTx({ network, walletId, quote })
    const client = this.getClient(network, walletId, quote.from, quote.fromAccountId)
    const approveTx = await client.chain.sendTransaction(txData)

    return {
      status: 'WAITING_FOR_APPROVE_CONFIRMATIONS',
      approveTx,
      approveTxHash: approveTx.hash
    }
  }

  // ======== SWAP ========

  async buildSwapTx ({ network, walletId, quote }) {
    const ctrlContract = new ethers.Contract(OriginsContractAddresses[network].ZERO_controller, controllerABI, this._getApi(network, quote.from))
    const currencyAmount = unitToCurrency(cryptoassets[quote.from], quote.fromAmount).toFixed()
    const encodedData = ctrlContract.interface.encodeFunctionData('contribute', [currencyAmount])

    return {
      from: quote.fromAccountId, // Required for estimation only (not used in chain client)
      to: OriginsContractAddresses[network].ZERO_controller,
      value: currencyAmount,
      data: encodedData,
      fee: quote.fee
    }
  }

  async sendSwap ({ network, walletId, quote }) {
    const txData = await this.buildSwapTx({ network, walletId, quote })
    const client = this.getClient(network, walletId, quote.from, quote.fromAccountId)
    const swapTx = await client.chain.sendTransaction(txData)

    return {
      status: 'WAITING_FOR_SWAP_CONFIRMATIONS',
      swapTx,
      swapTxHash: swapTx.hash
    }
  }

  //  ======== FEES ========

  async estimateFees ({ network, walletId, asset, txType, quote, feePrices, max }) {
    if (txType !== OriginsSwapProvider.fromTxType) throw new Error(`Invalid tx type ${txType}`)

    const nativeAsset = chains[cryptoassets[asset].chain].nativeAsset
    const account = this.getAccount(quote.fromAccountId)
    const client = this.getClient(network, walletId, quote.from, account?.type)

    let gasLimit = 0
    if (await this.requiresApproval({ network, walletId, quote })) {
      const approvalTx = await this.buildApprovalTx({ network, walletId, quote })
      const rawApprovalTx = {
        from: approvalTx.from,
        to: approvalTx.to,
        data: approvalTx.data,
        value: '0x' + approvalTx.value.toString(16)
      }

      gasLimit += await client.getMethod('estimateGas')(rawApprovalTx)
    }

    // Due to a problem on RSK network with incorrect gas estimations, the gas used by swap transaction
    // is hardcoded to 750k. This value is recommended by Sovryn team! Real gas usage is between 380k and 500k
    // and it depends on the number of steps in the conversion path.
    gasLimit += 750000

    const fees = {}
    for (const feePrice of feePrices) {
      const gasPrice = BN(feePrice).times(1e9) // ETH fee price is in gwei
      const fee = BN(gasLimit).times(1.1).times(gasPrice)
      fees[feePrice] = unitToCurrency(cryptoassets[nativeAsset], fee).toFixed()
    }

    return fees
  }

  // ======== STATE TRANSITIONS ========

  async waitForApproveConfirmations ({ swap, network, walletId }) {
    const client = this.getClient(network, walletId, swap.from, swap.fromAccountId)

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
    const client = this.getClient(network, walletId, swap.from, swap.fromAccountId)

    try {
      const tx = await client.chain.getTransactionByHash(swap.swapTxHash)
      if (tx && tx.confirmations > 0) {
        // Check transaction status - it may fail due to slippage
        const { status } = await client.getMethod('getTransactionReceipt')(swap.swapTxHash)
        this.updateBalances({ network, walletId, assets: [swap.from] })
        return {
          endTime: Date.now(),
          status: Number(status) === 1 ? 'SUCCESS' : 'FAILED'
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

  // ======== HELPER METHODS ========

  _getApi (network, asset) {
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

  // 0.5 slippage
  _calculateSlippage (amount) {
    return BN(amount).times(new BN(0.995)).toFixed(0)
  }

  // ======== STATIC ========

  static txTypes = {
    SWAP: 'SWAP'
  }

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
          message: 'Engaging Origins'
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

  static fromTxType = OriginsSwapProvider.txTypes.SWAP
  static toTxType = null
  static timelineDiagramSteps = ['APPROVE', 'SWAP']
  static totalSteps = 3
}

export { OriginsSwapProvider }
